/**
 * 見た目（Appearance）チェック
 * - ひらがな・漢字比率
 * - 余白の有無
 * - 強調表現の有無
 */

function checkAppearance(text) {
    const issues = [];
    // ひらがな・漢字比率
    const hiragana = (text.match(/[ぁ-ん]/g) || []).length;
    const kanji = (text.match(/[一-龥]/g) || []).length;
    if (kanji > 0) {
        const ratio = hiragana / (hiragana + kanji);
        if (ratio < 0.6 || ratio > 0.8) {
            issues.push(`ひらがな：漢字の比率が適切ではありません（現在: ${Math.round(ratio*100)}% ひらがな）。`);
        }
    }
    // 余白（改行）の有無
    if (!text.includes('\n')) {
        issues.push('余白（改行）がありません。適度に段落を分けましょう。');
    }
    // 強調表現の有無
    if (!text.match(/[「」『』【】]/)) {
        issues.push('強調表現（「」や【】など）が使われていません。必要に応じて強調しましょう。');
    }
    return issues;
}

module.exports = checkAppearance; 