/**
 * 音読（Reading）チェック
 * - 文章の長さ
 * - 句読点の有無
 * - リズム感
 */

function checkReading(text) {
    const issues = [];
    // 1文の長さ（40文字以上なら警告）
    const sentences = text.split(/[。！？]/);
    sentences.forEach((sentence, idx) => {
        if (sentence.length > 40) {
            issues.push(`第${idx+1}文が長すぎます（${sentence.length}文字）。適度に区切りましょう。`);
        }
    });
    // 句読点の有無
    if (!text.match(/[、。]/)) {
        issues.push('句読点（、や。）が使われていません。リズム感を意識しましょう。');
    }
    return issues;
}

module.exports = checkReading; 