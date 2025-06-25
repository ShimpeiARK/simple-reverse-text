# セキュリティ実装ドキュメント

## 概要
UXWritingRecipeは、セキュアなClaude API統合を提供するNode.js Webアプリケーションです。
OWASP LLM Top 10とMITRE ATLASの脅威モデルに基づいて包括的なセキュリティ機能を実装しています。

## 実装済みセキュリティ機能

### 1. 認証・認可（LLM07対策）

**場所**: `middleware/auth.js`

**機能**:
- APIキーベースの認証
- タイミング攻撃に対する保護
- SHA-256ハッシュ化による安全なキー保存
- 複数APIキーのサポート

**使用方法**:
```bash
# 環境変数設定
AUTH_ENABLED=true
API_KEYS=your-api-key-1,your-api-key-2

# リクエスト例
curl -X POST "http://localhost:3000/api/generate" \
  -H "Authorization: Bearer your-api-key-1" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "テストプロンプト"}'
```

### 2. 入力検証（LLM01対策）

**場所**: `middleware/inputValidator.js`

**機能**:
- プロンプトインジェクション検出
- 入力長制限（最大5000文字）
- HTMLエスケープ
- 危険なキーワード検出
- パストラバーサル防止

**検出パターン**:
```javascript
// プロンプトインジェクション
- "ignore previous instructions"
- "system:"
- "{{injection}}"
- "前の指示を無視"

// 危険なキーワード
- "eval", "script", "javascript"
- "document.cookie", "localStorage"
```

### 3. レート制限（LLM10対策）

**場所**: `middleware/rateLimiter.js`

**機能**:
- グローバルレート制限（100回/15分）
- API専用制限（10回/1分）
- クライアント別追跡
- 統計情報の提供

**設定**:
```bash
# グローバル制限
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# API制限
API_RATE_LIMIT_MAX_REQUESTS=10
API_RATE_LIMIT_WINDOW_MS=60000
```

### 4. セキュリティヘッダー

**場所**: `middleware/security.js`

**実装ヘッダー**:
- Content Security Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict Transport Security (HTTPS時)
- Referrer Policy

### 5. ログサニタイゼーション（LLM02対策）

**機能**:
- 機密情報の自動マスキング
- スタックトレースの安全化
- 構造化ログの実装

**マスキング対象**:
```javascript
// 自動マスキング
api_key=secret123      → api_key=[REDACTED]
password=mypass        → password=[REDACTED]
user@example.com       → [EMAIL_REDACTED]
Authorization: Bearer  → Authorization=[REDACTED]
```

### 6. ファイル操作の安全化

**場所**: `src/main.js`

**機能**:
- パストラバーサル防止
- ディレクトリ制限
- ファイルサイズ制限（10MB）
- 存在確認

**安全化例**:
```javascript
// 危険: ../../../etc/passwd
// 安全: data/file.txt
```

## セキュリティ設定

### 開発環境
```bash
# .env.development
NODE_ENV=development
AUTH_ENABLED=false        # 開発時は無効化可能
RATE_LIMIT_ENABLED=false
LOG_LEVEL=debug
```

### 本番環境
```bash
# .env.production
NODE_ENV=production
AUTH_ENABLED=true         # 必須
RATE_LIMIT_ENABLED=true   # 必須
API_KEYS=strong-key-1,strong-key-2  # 16文字以上推奨
ANTHROPIC_API_KEY=your-claude-key    # Claude API必須
ALLOWED_ORIGINS=https://yourdomain.com
```

## セキュリティテスト

### テスト実行
```bash
# 全体テスト
npm test

# セキュリティ特化テスト
npm run test:security

# 脆弱性スキャン
npm run security:audit
```

### テストカバレッジ
- ✅ 認証テスト（有効/無効キー）
- ✅ プロンプトインジェクション検出
- ✅ レート制限の動作確認
- ✅ パストラバーサル防止
- ✅ ログサニタイゼーション

## API使用例

### 認証付きテキスト生成
```bash
curl -X POST "http://localhost:3000/api/generate" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "この文章のUXライティングをチェックしてください：ログインしてください。"
  }'
```

### レスポンス例
```json
{
  "result": "より親しみやすい表現として「ログイン」を「サインイン」に変更することをお勧めします...",
  "metadata": {
    "promptLength": 45,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### エラーレスポンス例
```json
// 認証エラー
{
  "error": "Unauthorized",
  "message": "Valid API key required"
}

// 入力検証エラー
{
  "error": "Validation Error", 
  "message": "Security violation in prompt: Potential injection pattern detected"
}

// レート制限エラー
{
  "error": "Too Many Requests",
  "message": "API rate limit exceeded. Please slow down.",
  "retryAfter": 60
}
```

## 監視とアラート

### セキュリティイベント
以下のイベントが自動的に記録されます：

1. **認証失敗**
   ```
   Authentication failed for IP: 192.168.1.1, User-Agent: curl/7.68.0
   ```

2. **レート制限違反**
   ```
   API rate limit exceeded for client: abc123_def456, IP: 192.168.1.1
   ```

3. **入力検証失敗**
   ```
   Input validation failed: Security violation in prompt, IP: 192.168.1.1
   ```

4. **ファイルアクセス試行**
   ```
   Error: Access to files outside the project directory is not allowed
   ```

### ヘルスチェック
```bash
curl http://localhost:3000/health
```

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

## インシデント対応

### 1. 不審なアクセスの検出
```bash
# ログの確認
grep "Authentication failed" /var/log/app.log

# IPアドレスのブロック（外部ツール使用）
```

### 2. レート制限調整
```bash
# 環境変数の動的更新
export API_RATE_LIMIT_MAX_REQUESTS=5
# アプリケーション再起動
```

### 3. APIキーのローテーション
```bash
# 新しいキーを追加
export API_KEYS="old-key,new-key-1,new-key-2"
# 古いキーを削除
export API_KEYS="new-key-1,new-key-2"
```

## セキュリティベストプラクティス

### 1. APIキー管理
- 最低16文字以上の強力なキー
- 定期的なローテーション（90日推奨）
- 環境変数での管理
- 本番と開発環境の分離

### 2. 監視
- セキュリティイベントの定期レビュー
- 異常パターンの早期検出
- 自動アラートの設定

### 3. 更新
- 依存関係の定期更新
- セキュリティパッチの迅速適用
- 脆弱性スキャンの定期実施

## 既知の制限事項

1. **認証**
   - 現在はAPIキーのみサポート
   - OAuth2.0やJWTは未実装

2. **レート制限**
   - メモリベースの実装
   - 分散環境ではRedis等が必要

3. **ファイル処理**
   - 同期読み込みのみ
   - 大容量ファイル処理の最適化が必要

## 今後の改善予定

1. **認証拡張**
   - JWT トークン対応
   - OAuth2.0 統合
   - MFA サポート

2. **監視強化**
   - リアルタイム異常検知
   - ダッシュボード実装
   - SIEM統合

3. **パフォーマンス**
   - 非同期ファイル処理
   - キャッシュ機能
   - 負荷分散対応

## 参考資料

- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [MITRE ATLAS](https://atlas.mitre.org/)
- [セキュリティ評価ガイドライン](https://github.com/Tomato-hamburger/security_guidline)
- [Claude API Documentation](https://docs.anthropic.com/)

## 脆弱性報告

セキュリティ問題を発見した場合は、適切なチャンネルを通じて報告してください。