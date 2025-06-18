/**
 * 行動につなげる（Actionability）チェック
 * - 具体的なアクションの有無
 * - ポジティブ表現
 * - 責めない表現
 */

const vagueActions = ['頑張ります', '努力します', '気をつけます', '検討します'];
const negativeExpressions = ['ダメ', 'できない', '無理', '失敗', '責任', 'あなたのせい'];

function checkActionability(text) {
    const issues = [];
    // 具体的なアクションの有無
    vagueActions.forEach(phrase => {
        if (text.includes(phrase)) {
            issues.push(`曖昧なアクション「${phrase}」が使われています。具体的な行動を示しましょう。`);
        }
    });
    // ネガティブ・責める表現の検出
    negativeExpressions.forEach(word => {
        if (text.includes(word)) {
            issues.push(`ネガティブまたは責める表現「${word}」が使われています。ポジティブな表現にしましょう。`);
        }
    });
    return issues;
}

module.exports = checkActionability; 