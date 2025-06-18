/**
 * 状況整理（Context）チェック
 * - 現状・理想・方向性の記載有無
 */

const contextKeywords = ['現状', '理想', '方向性', '課題', '目指す', '今後', '将来'];

function checkContext(text) {
    const issues = [];
    // 現状・理想・方向性のいずれかが含まれているか
    if (!contextKeywords.some(word => text.includes(word))) {
        issues.push('現状・理想・方向性などの状況整理が記載されていません。');
    }
    return issues;
}

module.exports = checkContext; 