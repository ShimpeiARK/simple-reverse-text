const crypto = require('crypto');

class AuthManager {
  constructor() {
    // 環境変数からAPIキーを取得
    const apiKeysStr = process.env.API_KEYS || '';
    this.apiKeys = apiKeysStr.split(',').filter(key => key.trim().length > 0);
    this.enabled = process.env.AUTH_ENABLED !== 'false';
    
    if (this.enabled && this.apiKeys.length === 0) {
      console.warn('Authentication is enabled but no API keys are configured');
    }
    
    // APIキーをハッシュ化して保存（タイミング攻撃対策）
    this.hashedKeys = new Set();
    this.apiKeys.forEach(key => {
      const hashedKey = this.hashApiKey(key.trim());
      this.hashedKeys.add(hashedKey);
    });
    
    console.log(`Authentication: ${this.enabled ? 'Enabled' : 'Disabled'} with ${this.hashedKeys.size} API keys`);
  }

  /**
   * APIキーをSHA-256でハッシュ化
   */
  hashApiKey(apiKey) {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * タイミング攻撃に対して安全な比較
   */
  timingSafeCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    
    return crypto.timingSafeEqual(bufferA, bufferB);
  }

  /**
   * APIキーの検証
   */
  validateApiKey(apiKey) {
    if (!this.enabled) {
      return true;
    }

    if (!apiKey) {
      return false;
    }

    const hashedKey = this.hashApiKey(apiKey);
    
    // 全てのキーと比較してタイミング攻撃を防ぐ
    let isValid = false;
    for (const storedKey of this.hashedKeys) {
      if (this.timingSafeCompare(hashedKey, storedKey)) {
        isValid = true;
      }
    }

    return isValid;
  }

  /**
   * リクエストからAPIキーを抽出
   */
  extractApiKey(req) {
    // Authorizationヘッダーから取得
    const authHeader = req.headers.authorization;
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
      if (authHeader.startsWith('API-Key ')) {
        return authHeader.substring(8);
      }
    }

    // X-API-Keyヘッダーから取得
    const apiKeyHeader = req.headers['x-api-key'];
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    return null;
  }
}

// シングルトンインスタンス
const authManager = new AuthManager();

/**
 * 認証ミドルウェア
 */
function authenticate(req, res, next) {
  const apiKey = authManager.extractApiKey(req);
  
  if (!authManager.validateApiKey(apiKey)) {
    console.warn(`Authentication failed for IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Valid API key required' 
    });
  }

  // APIキーが有効な場合、次のミドルウェアへ
  next();
}

module.exports = {
  authenticate,
  authManager
};