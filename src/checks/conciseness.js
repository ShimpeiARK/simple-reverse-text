/**
 * 簡潔さ（Conciseness）チェック
 * - 冗長な表現
 * - 重複表現
 * - 過度な丁寧さ
 * などを検出
 */

const redundantPhrases = ['ということ', 'することができる', 'において', 'におかれましては', '〜のような形で', '〜することとなっております'];
const duplicatePatterns = [/([ぁ-んァ-ン一-龥a-zA-Z0-9]{2,})\1+/g];

function checkConciseness(text) {
    const issues = [];
    // 冗長な表現の検出
    redundantPhrases.forEach(phrase => {
        if (text.includes(phrase)) {
            issues.push(`冗長な表現「${phrase}」が使われています。簡潔にしましょう。`);
        }
    });
    // 重複表現の検出
    duplicatePatterns.forEach(pattern => {
        if (pattern.test(text)) {
            issues.push('重複した表現が含まれています。簡潔にしましょう。');
        }
    });
    return issues;
}

module.exports = checkConciseness; 