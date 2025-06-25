/**
 * レート制限ミドルウェア
 */

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15分
    this.maxRequests = options.maxRequests || 100;
    this.enabled = options.enabled !== false;
    this.requests = new Map();
    
    console.log(`Rate Limiter: ${this.enabled ? 'Enabled' : 'Disabled'} - ${this.maxRequests} requests per ${this.windowMs}ms`);
    
    if (this.enabled) {
      // 定期的にクリーンアップを実行
      setInterval(() => {
        this.cleanup();
      }, this.windowMs);
    }
  }

  /**
   * クライアント識別子を生成
   */
  getClientId(req) {
    // IPアドレスベースの識別（プロキシ対応）
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
    
    // User-Agentも含めてより詳細な識別
    const userAgent = req.headers['user-agent'] || 'unknown';
    const hashedUA = require('crypto').createHash('sha256').update(userAgent).digest('hex').substring(0, 8);
    
    return `${ip}_${hashedUA}`;
  }

  /**
   * レート制限をチェック
   */
  checkLimit(clientId) {
    if (!this.enabled) {
      return { allowed: true, remaining: this.maxRequests };
    }

    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // クライアントのリクエスト履歴を取得
    let clientRequests = this.requests.get(clientId) || [];
    
    // ウィンドウ外のリクエストを除去
    clientRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    // 制限チェック
    if (clientRequests.length >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: clientRequests[0] + this.windowMs
      };
    }

    // 新しいリクエストを記録
    clientRequests.push(now);
    this.requests.set(clientId, clientRequests);

    return {
      allowed: true,
      remaining: this.maxRequests - clientRequests.length,
      resetTime: now + this.windowMs
    };
  }

  /**
   * 古いリクエスト履歴をクリーンアップ
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - this.windowMs * 2;
    let cleanedCount = 0;

    for (const [clientId, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > cutoff);
      
      if (validRequests.length === 0) {
        this.requests.delete(clientId);
        cleanedCount++;
      } else if (validRequests.length !== requests.length) {
        this.requests.set(clientId, validRequests);
      }
    }

    if (cleanedCount > 0) {
      console.log(`Rate limiter cleaned up ${cleanedCount} expired entries`);
    }
  }

  /**
   * 統計情報を取得
   */
  getStats() {
    let totalRequests = 0;
    for (const requests of this.requests.values()) {
      totalRequests += requests.length;
    }

    return {
      activeClients: this.requests.size,
      totalRequests: totalRequests
    };
  }
}

// グローバル設定
const globalLimiter = new RateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  enabled: process.env.RATE_LIMIT_ENABLED !== 'false'
});

// API専用のより厳しい制限
const apiLimiter = new RateLimiter({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1分
  maxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 10,   // 10回
  enabled: process.env.RATE_LIMIT_ENABLED !== 'false'
});

/**
 * グローバルレート制限ミドルウェア
 */
function globalRateLimit(req, res, next) {
  const clientId = globalLimiter.getClientId(req);
  const result = globalLimiter.checkLimit(clientId);

  // ヘッダーに情報を追加
  res.set({
    'X-RateLimit-Limit': globalLimiter.maxRequests,
    'X-RateLimit-Remaining': result.remaining || 0,
    'X-RateLimit-Reset': result.resetTime || Date.now()
  });

  if (!result.allowed) {
    console.warn(`Global rate limit exceeded for client: ${clientId}, IP: ${req.ip}`);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Global rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
    });
  }

  next();
}

/**
 * API専用レート制限ミドルウェア
 */
function apiRateLimit(req, res, next) {
  const clientId = apiLimiter.getClientId(req);
  const result = apiLimiter.checkLimit(clientId);

  // APIレート制限ヘッダー
  res.set({
    'X-API-RateLimit-Limit': apiLimiter.maxRequests,
    'X-API-RateLimit-Remaining': result.remaining || 0,
    'X-API-RateLimit-Reset': result.resetTime || Date.now()
  });

  if (!result.allowed) {
    console.warn(`API rate limit exceeded for client: ${clientId}, IP: ${req.ip}`);
    return res.status(429).json({
      error: 'API Rate Limit Exceeded',
      message: 'Too many API requests. Please slow down.',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
    });
  }

  next();
}

/**
 * レート制限統計エンドポイント（管理用）
 */
function getRateLimitStats(req, res) {
  const globalStats = globalLimiter.getStats();
  const apiStats = apiLimiter.getStats();

  res.json({
    global: {
      ...globalStats,
      windowMs: globalLimiter.windowMs,
      maxRequests: globalLimiter.maxRequests,
      enabled: globalLimiter.enabled
    },
    api: {
      ...apiStats,
      windowMs: apiLimiter.windowMs,
      maxRequests: apiLimiter.maxRequests,
      enabled: apiLimiter.enabled
    }
  });
}

module.exports = {
  globalRateLimit,
  apiRateLimit,
  getRateLimitStats,
  RateLimiter
};