# Simple Reverse Text

文字列を逆さまにする簡単なJavaScriptツールです。

## インストール方法

```bash
npm install simple-reverse-text
```

## 使い方

```javascript
const reverseText = require('simple-reverse-text');

// 文字列を逆さまにする
console.log(reverseText('hello')); // => 'olleh'
console.log(reverseText('こんにちは')); // => 'はちにんこ'
```

## テスト

```bash
npm test
```

## ライセンス

MITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

# Writing Recipe Checker

日本語文章を「ライティングレシピ」に沿って自動チェックし、観点ごとに指摘を出すOSSツールです。

## インストール方法

```bash
npm install writing-recipe-checker
```

## 使い方

### 1. CLIで使う
```bash
node src/main.js 入力ファイル.txt
```
または標準入力で
```bash
echo "文章" | node src/main.js
```

### 2. テストを実行
```bash
node test/checks.test.js
```

## チェック観点
- 明確さ（Clarity）
- 簡潔さ（Conciseness）
- 行動につなげる（Actionability）
- 見た目（Appearance）
- 音読（Reading）
- ビジネスゴール（Business Goal）
- 状況整理（Context）
- 文章構造（Structure）

## サンプル出力
```
【clarity】
 - 指示代名詞「これ」が使われています。具体的に書きましょう。
 - 専門用語「KPI」が使われています。必要に応じて説明を加えましょう。

【conciseness】
 - 冗長な表現「しっかり」が使われています。簡潔にしましょう。

...（以下略）
```

## ライセンス

MITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。 