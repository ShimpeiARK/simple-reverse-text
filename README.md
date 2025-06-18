# Writing Recipe Checker

日本語文章を「ライティングレシピ」に沿って自動チェックし、観点ごとに指摘を出すOSSツールです。

## インストール方法

```bash
git clone https://github.com/ShimpeiARK/simple-reverse-text.git
cd simple-reverse-text
npm install
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