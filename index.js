const express = require('express');
const dotenv = require('dotenv');
const claudeService = require('./claudeService');

// 環境変数の設定
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルートの設定
app.get('/', (req, res) => {
  res.send('ClaudeCode Max API サーバーへようこそ！');
});

// Claude APIエンドポイント
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'プロンプトが必要です' });
    }

    const result = await claudeService.generateCode(prompt);
    res.json({ result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーが起動しました: http://localhost:${port}`);
}); 