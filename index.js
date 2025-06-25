const express = require('express');
const dotenv = require('dotenv');
const claudeService = require('./claudeService');

// セキュリティミドルウェアのインポート
const { authenticate } = require('./middleware/auth');
const { validatePrompt } = require('./middleware/inputValidator');
const { globalRateLimit, apiRateLimit, getRateLimitStats } = require('./middleware/rateLimiter');
const { 
  setSecurityHeaders, 
  configureCORS, 
  logRequest, 
  errorHandler, 
  notFoundHandler, 
  healthCheck 
} = require('./middleware/security');

// 環境変数の設定
dotenv.config();

// 環境変数の検証
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY environment variable is required');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// セキュリティミドルウェアの適用
app.use(setSecurityHeaders);
app.use(configureCORS);
app.use(logRequest);
app.use(globalRateLimit);

// JSON解析の設定（サイズ制限付き）
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // リクエストボディの保存（検証用）
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// ルートの設定
app.get('/', (req, res) => {
  res.json({
    message: 'UXWritingRecipe API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /health - ヘルスチェック',
      'POST /api/generate - テキスト生成（認証必要）',
      'GET /api/stats - レート制限統計（認証必要）'
    ]
  });
});

// ヘルスチェックエンドポイント
app.get('/health', healthCheck);

// 認証が必要なAPIエンドポイント
app.use('/api', authenticate);

// Claude APIエンドポイント（セキュリティ強化版）
app.post('/api/generate', apiRateLimit, validatePrompt, async (req, res) => {
  try {
    // 検証済みのプロンプトを使用
    const { prompt } = req.validatedBody;
    
    console.log(`Generating content for prompt length: ${prompt.length}`);
    
    const result = await claudeService.generateCode(prompt);
    
    res.json({ 
      result,
      metadata: {
        promptLength: prompt.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Claude API Error:', error.message);
    
    // エラーの種類に応じて適切なレスポンスを返す
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      return res.status(429).json({ 
        error: 'Rate Limit Exceeded',
        message: 'Claude API rate limit exceeded. Please try again later.' 
      });
    }
    
    if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
      return res.status(401).json({ 
        error: 'Authentication Error',
        message: 'Invalid Claude API credentials.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Text generation failed. Please try again later.' 
    });
  }
});

// レート制限統計エンドポイント（管理用）
app.get('/api/stats', getRateLimitStats);

// 404ハンドラー
app.use(notFoundHandler);

// エラーハンドラー
app.use(errorHandler);

// サーバーの起動
const server = app.listen(port, () => {
  console.log(`UXWritingRecipe Server started on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Authentication: ${process.env.AUTH_ENABLED !== 'false' ? 'Enabled' : 'Disabled'}`);
  console.log(`Rate Limiting: ${process.env.RATE_LIMIT_ENABLED !== 'false' ? 'Enabled' : 'Disabled'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 