/**
 * 明確さ（Clarity）チェック
 * - 指示代名詞の多用
 * - 専門用語の説明不足
 * などを検出
 */

const demonstratives = ['これ', 'それ', 'あれ', 'この', 'その', 'あの', 'ここ', 'そこ', 'あそこ'];
const technicalTerms = ['KPI', 'ROI', 'PDCA', 'API', 'UX', 'UI']; // 例: よくある専門用語

function checkClarity(text) {
    const issues = [];
    // 指示代名詞の検出
    demonstratives.forEach(word => {
        if (text.includes(word)) {
            issues.push(`指示代名詞「${word}」が使われています。具体的に書きましょう。`);
        }
    });
    // 専門用語の説明不足（単純な検出）
    technicalTerms.forEach(term => {
        if (text.includes(term)) {
            issues.push(`専門用語「${term}」が使われています。必要に応じて説明を加えましょう。`);
        }
    });
    return issues;
}

module.exports = checkClarity; 