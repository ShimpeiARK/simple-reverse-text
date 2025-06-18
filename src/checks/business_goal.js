/**
 * ビジネスゴール（Business Goal）チェック
 * - 指標や評価方法の有無
 * - 曖昧な表現の検出
 */

const goalKeywords = ['KPI', '目標', '指標', '評価', '達成', '検証', '測定', 'ゴール'];
const vagueGoalPhrases = ['しっかり', 'できるだけ', 'なるべく', '適切に', '十分に', '最大限'];

function checkBusinessGoal(text) {
    const issues = [];
    // 指標や評価方法の有無
    if (!goalKeywords.some(word => text.includes(word))) {
        issues.push('ビジネスゴールや指標、評価方法が明記されていません。具体的に記載しましょう。');
    }
    // 曖昧な表現の検出
    vagueGoalPhrases.forEach(phrase => {
        if (text.includes(phrase)) {
            issues.push(`曖昧な表現「${phrase}」が使われています。具体的に記載しましょう。`);
        }
    });
    return issues;
}

module.exports = checkBusinessGoal; 