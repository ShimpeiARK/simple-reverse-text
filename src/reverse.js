/**
 * 文字列を逆さまにする関数
 * @param {string} text - 逆さまにしたい文字列
 * @returns {string} 逆さまになった文字列
 */
function reverseText(text) {
    return text.split('').reverse().join('');
}

module.exports = reverseText; 