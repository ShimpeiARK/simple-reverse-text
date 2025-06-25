# UXWritingRecipe 📝✨

UXライティングを改善するためのAI支援ツールです。Claude APIを活用して文章の品質をチェックし、具体的な改善提案を提供します。

## 🚀 主な機能

### 1. AI文章チェック（Web API）
Claude APIを使った高精度な文章分析と改善提案

### 2. ローカル文章チェック（CLI）
事前定義されたルールベースの文章チェック

### 3. セキュアなAPI設計
- 🔐 APIキー認証
- 🛡️ プロンプトインジェクション対策
- ⚡ レート制限
- 📊 セキュリティ監視

## 📦 インストール

```bash
git clone https://github.com/Tomato-hamburger/UXWritingRecipe.git
cd UXWritingRecipe
npm install
```

## ⚙️ 環境設定

```bash
# .envファイルの作成
cp .env.example .env

# 必要な環境変数を設定
ANTHROPIC_API_KEY=your-claude-api-key
API_KEYS=your-secure-api-key-1,your-secure-api-key-2
AUTH_ENABLED=true
RATE_LIMIT_ENABLED=true
```

## 🌐 Web API使用方法

### サーバー起動
```bash
npm start
# または開発モード
npm run dev
```

### API呼び出し例

#### 1. ヘルスチェック
```bash
curl http://localhost:3000/health
```

**レスポンス例:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "uptime": "3600s",
  "memory": {
    "used": "45MB",
    "total": "128MB"
  },
  "environment": "production"
}
```

#### 2. 文章改善提案（認証必要）
```bash
curl -X POST "http://localhost:3000/api/generate" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "ログインボタンをクリックして、アカウントにアクセスしてください。"
  }'
```

**レスポンス例:**
```json
{
  "result": "改善提案:\n\n1. **明確性の向上**\n   - 「ログインボタンをクリック」→「ログインボタンを選択」\n   - より直感的な表現に変更\n\n2. **簡潔性の改善**\n   - 「アカウントにアクセスしてください」→「アカウントを開く」\n   - 無駄な文字数を削減\n\n3. **行動誘導の強化**\n   - 「ログイン」→「マイページへ」\n   - ユーザーの目的を明確に\n\n**改善後:**\n「マイページへボタンを選択してアカウントを開く」",
  "metadata": {
    "promptLength": 35,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### 3. レート制限統計（認証必要）
```bash
curl -H "Authorization: Bearer your-api-key" \
     http://localhost:3000/api/stats
```

**レスポンス例:**
```json
{
  "global": {
    "activeClients": 5,
    "totalRequests": 127,
    "windowMs": 900000,
    "maxRequests": 100,
    "enabled": true
  },
  "api": {
    "activeClients": 3,
    "totalRequests": 45,
    "windowMs": 60000,
    "maxRequests": 10,
    "enabled": true
  }
}
```

## 💻 CLI使用方法

### ファイルチェック
```bash
node src/main.js sample.txt
```

**入力例（sample.txt）:**
```
ユーザーはログインしてください。
この機能はとても便利です。
しっかりと確認してください。
```

**出力例:**
```
【clarity】
 - 指示代名詞「この」が使われています。具体的に書きましょう。

【conciseness】
 - 冗長な表現「しっかりと」が使われています。簡潔にしましょう。
 - 冗長な表現「とても」が使われています。簡潔にしましょう。

【actionability】
 - 曖昧な指示「確認してください」があります。具体的な行動を示しましょう。
```

### 標準入力でのチェック
```bash
echo "ユーザーは必ずログインしてください。" | node src/main.js
```

**出力例:**
```
【conciseness】
 - 冗長な表現「必ず」が使われています。簡潔にしましょう。

【actionability】
 - 強制的な表現「してください」があります。より柔らかい表現を検討しましょう。
```

## 🛡️ セキュリティ機能

### エラーレスポンス例

#### 認証エラー
```json
{
  "error": "Unauthorized",
  "message": "Valid API key required"
}
```

#### プロンプトインジェクション検出
```json
{
  "error": "Validation Error",
  "message": "Security violation in prompt: Potential injection pattern detected"
}
```

#### レート制限エラー
```json
{
  "error": "Too Many Requests",
  "message": "API rate limit exceeded. Please slow down.",
  "retryAfter": 60
}
```

## 📊 チェック観点（CLI版）

| 観点 | 説明 | チェック例 |
|------|------|-----------|
| **明確さ（Clarity）** | 曖昧な表現を検出 | 指示代名詞「これ」「それ」の使用 |
| **簡潔さ（Conciseness）** | 冗長な表現を検出 | 「とても」「しっかり」「必ず」 |
| **行動誘導（Actionability）** | 行動につながる表現か | 「確認してください」→具体的な行動 |
| **見た目（Appearance）** | 読みやすさ | 長すぎる文章、改行の適切性 |
| **音読（Reading）** | 音読時の自然さ | 読みにくい表現、リズム |
| **ビジネスゴール（Business Goal）** | 目的との整合性 | ゴールに導く表現か |
| **状況整理（Context）** | 文脈の適切性 | 状況に応じた適切な表現 |
| **文章構造（Structure）** | 構造の論理性 | 文章の流れ、構成 |

## 🧪 テスト実行

```bash
# 全体テスト
npm test

# セキュリティテスト
npm run test:security

# 脆弱性スキャン
npm run security:audit
```

## 🔧 開発モード

```bash
# 開発サーバー起動（ホットリロード）
npm run dev

# セキュリティ無効化（開発時のみ）
AUTH_ENABLED=false
RATE_LIMIT_ENABLED=false
```

## 📈 本番環境設定

```bash
# 環境変数設定
NODE_ENV=production
AUTH_ENABLED=true
RATE_LIMIT_ENABLED=true
API_KEYS=strong-key-1,strong-key-2
ANTHROPIC_API_KEY=your-production-claude-key
ALLOWED_ORIGINS=https://yourdomain.com

# 本番起動
npm start
```

## 🔗 エンドポイント一覧

| エンドポイント | メソッド | 認証 | 説明 |
|---------------|---------|------|------|
| `/` | GET | 不要 | サーバー情報 |
| `/health` | GET | 不要 | ヘルスチェック |
| `/api/generate` | POST | 必要 | AI文章改善 |
| `/api/stats` | GET | 必要 | レート制限統計 |

## 📚 実装技術

- **Backend**: Node.js + Express
- **AI**: Anthropic Claude API
- **Security**: カスタム認証・レート制限ミドルウェア
- **Testing**: Jest + Supertest
- **Monitoring**: セキュリティイベント監視

## 🛡️ セキュリティ仕様

- **認証**: APIキーベース（SHA-256ハッシュ化）
- **レート制限**: 2段階（グローバル+API専用）
- **入力検証**: プロンプトインジェクション検出
- **ログ保護**: 機密情報自動マスキング
- **セキュリティヘッダー**: CSP、XSS保護など完備

詳細は [SECURITY.md](SECURITY.md) を参照してください。

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

- 🐛 バグ報告: [Issues](https://github.com/Tomato-hamburger/UXWritingRecipe/issues)
- 💡 機能要望: [Issues](https://github.com/Tomato-hamburger/UXWritingRecipe/issues)
- 🔒 セキュリティ問題: セキュリティポリシーに従って報告 