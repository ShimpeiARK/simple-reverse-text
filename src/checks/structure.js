/**
 * 文章構造（Structure）チェック
 * - 情報のまとまりごとに段落分けされているか
 * - 口語表現の有無
 */

const colloquialPhrases = ['〜だよ', '〜だね', '〜かな', '〜じゃん', '〜だろう', '〜だぜ'];

function checkStructure(text) {
    const issues = [];
    // 段落分け（改行がない場合警告）
    if (!text.includes('\n')) {
        issues.push('情報のまとまりごとに段落分け（改行）がされていません。');
    }
    // 口語表現の検出
    colloquialPhrases.forEach(phrase => {
        if (text.includes(phrase)) {
            issues.push(`口語表現「${phrase}」が使われています。文語に直しましょう。`);
        }
    });
    return issues;
}

module.exports = checkStructure; 