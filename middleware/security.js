/**
 * セキュリティミドルウェア
 */

/**
 * セキュリティヘッダーを設定
 */
function setSecurityHeaders(req, res, next) {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'none';"
  );

  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Strict Transport Security (HTTPS使用時のみ)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
}

/**
 * CORS設定
 */
function configureCORS(req, res, next) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim());

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-CSRF-Token'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24時間

  // プリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}

/**
 * リクエストログ記録
 */
function logRequest(req, res, next) {
  const start = Date.now();
  
  // レスポンス終了時にログ出力
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length') || 0
    };

    // 機密情報をマスク
    const sanitizedUrl = logData.url.replace(/([?&]api_?key=)[^&]+/gi, '$1[REDACTED]');
    logData.url = sanitizedUrl;

    console.log(`${logData.method} ${logData.url} ${logData.status} ${logData.duration} - ${logData.ip}`);
  });

  next();
}

/**
 * ログサニタイゼーション
 */
function sanitizeLogData(data) {
  if (typeof data === 'string') {
    return data
      .replace(/api[_-]?key["\']?\s*[:=]\s*["\']?[\w\-]+/gi, 'api_key=[REDACTED]')
      .replace(/password["\']?\s*[:=]\s*["\']?[^"\s]+/gi, 'password=[REDACTED]')
      .replace(/secret["\']?\s*[:=]\s*["\']?[\w\-]+/gi, 'secret=[REDACTED]')
      .replace(/token["\']?\s*[:=]\s*["\']?[\w\-\.]+/gi, 'token=[REDACTED]')
      .replace(/Authorization["\']?\s*[:=]\s*["\']?Bearer\s+[\w\-\.]+/gi, 'Authorization=[REDACTED]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }
  
  return data;
}

/**
 * 機密情報を含む可能性のあるキーかチェック
 */
function isSensitiveKey(key) {
  const sensitiveKeys = [
    'password', 'passwd', 'pwd', 'secret', 'apikey', 'api_key', 'api-key',
    'token', 'access_token', 'refresh_token', 'private_key', 'privatekey',
    'auth', 'authorization', 'credential', 'key'
  ];
  
  const lowerKey = key.toLowerCase();
  return sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
}

/**
 * エラーハンドリングミドルウェア
 */
function errorHandler(err, req, res, next) {
  // ログに記録（サニタイズ済み）
  const sanitizedError = sanitizeLogData({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  console.error('Error occurred:', sanitizedError);

  // 本番環境では詳細なエラー情報を隠す
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }

  // 開発環境では詳細なエラー情報を返す
  res.status(err.status || 500).json({
    error: err.name || 'Error',
    message: err.message,
    stack: err.stack
  });
}

/**
 * 404エラーハンドラー
 */
function notFoundHandler(req, res) {
  console.warn(`404 - Not Found: ${req.method} ${req.url} from ${req.ip}`);
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
}

/**
 * ヘルスチェックエンドポイント
 */
function healthCheck(req, res) {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime)}s`,
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    environment: process.env.NODE_ENV || 'development'
  });
}

module.exports = {
  setSecurityHeaders,
  configureCORS,
  logRequest,
  sanitizeLogData,
  errorHandler,
  notFoundHandler,
  healthCheck
};