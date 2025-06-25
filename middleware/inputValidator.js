/**
 * 入力検証ミドルウェア
 */

// プロンプトインジェクション検出パターン
const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /disregard\s+all\s+prior/i,
  /system\s*:\s*/i,
  /```system/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
  /\{\{.*\}\}/,
  /\$\{.*\}/,
  /新しい指示/i,
  /前の指示を無視/i,
  /システム:/i,
  /role\s*:\s*system/i
];

// 危険なキーワード
const DANGEROUS_KEYWORDS = [
  'eval',
  'function',
  'script',
  'javascript',
  'onload',
  'onerror',
  'onclick',
  '<script',
  '</script>',
  'document.cookie',
  'localStorage',
  'sessionStorage'
];

/**
 * HTMLエスケープ
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (m) => map[m]);
}

/**
 * プロンプトインジェクション検出
 */
function detectPromptInjection(text) {
  const lowerText = text.toLowerCase();
  
  // パターンマッチング
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        detected: true,
        reason: `Potential injection pattern detected: ${pattern.source}`
      };
    }
  }
  
  // 危険なキーワードチェック
  for (const keyword of DANGEROUS_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return {
        detected: true,
        reason: `Dangerous keyword detected: ${keyword}`
      };
    }
  }
  
  return { detected: false };
}

/**
 * 文字列の長さと内容を検証
 */
function validateString(value, fieldName, options = {}) {
  const {
    maxLength = 5000,
    minLength = 1,
    required = false,
    allowEmpty = false
  } = options;

  if (!value && required) {
    throw new Error(`${fieldName} is required`);
  }

  if (!value && allowEmpty) {
    return '';
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  if (value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters long`);
  }

  if (value.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }

  // プロンプトインジェクション検出
  const injectionResult = detectPromptInjection(value);
  if (injectionResult.detected) {
    throw new Error(`Security violation in ${fieldName}: ${injectionResult.reason}`);
  }

  return value.trim();
}

/**
 * プロンプト検証ミドルウェア
 */
function validatePrompt(req, res, next) {
  try {
    const { prompt } = req.body;

    // プロンプトの検証
    const validatedPrompt = validateString(prompt, 'prompt', {
      maxLength: 5000,
      minLength: 1,
      required: true
    });

    // 検証済みのプロンプトをリクエストに設定
    req.validatedBody = {
      prompt: validatedPrompt
    };

    console.log(`Prompt validation passed for ${validatedPrompt.length} characters`);
    next();

  } catch (error) {
    console.warn(`Input validation failed: ${error.message}, IP: ${req.ip}`);
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message
    });
  }
}

/**
 * ファイルパス検証（パストラバーサル対策）
 */
function validateFilePath(filePath) {
  // 危険なパターンをチェック
  const dangerousPatterns = [
    '../',
    '..\\',
    './',
    '.\\',
    '~/',
    '~\\',
    '/etc/',
    'C:\\',
    '\\\\',
    '%2e%2e',
    '%2f',
    '%5c'
  ];

  const normalizedPath = filePath.toLowerCase();
  
  for (const pattern of dangerousPatterns) {
    if (normalizedPath.includes(pattern.toLowerCase())) {
      throw new Error('Invalid file path: potential path traversal detected');
    }
  }

  // 絶対パスの禁止
  if (filePath.startsWith('/') || filePath.match(/^[A-Za-z]:\\/)) {
    throw new Error('Absolute paths are not allowed');
  }

  // 空文字列や null のチェック
  if (!filePath || filePath.trim().length === 0) {
    throw new Error('File path cannot be empty');
  }

  // 最大長チェック
  if (filePath.length > 255) {
    throw new Error('File path too long');
  }

  return filePath.trim();
}

/**
 * CSRFトークン生成（簡易版）
 */
function generateCSRFToken() {
  return require('crypto').randomBytes(16).toString('hex');
}

/**
 * CSRFトークン検証ミドルウェア
 */
function validateCSRF(req, res, next) {
  if (req.method === 'GET') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: 'CSRF Token Validation Failed',
      message: 'Invalid or missing CSRF token'
    });
  }

  next();
}

module.exports = {
  validatePrompt,
  validateString,
  validateFilePath,
  detectPromptInjection,
  escapeHtml,
  generateCSRFToken,
  validateCSRF
};