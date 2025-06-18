const reverseText = require('../src/reverse');

// テストケース
console.log('テスト開始');

// 通常の文字列
console.log('通常の文字列テスト:', reverseText('hello') === 'olleh' ? '✅ OK' : '❌ NG');

// 日本語
console.log('日本語テスト:', reverseText('こんにちは') === 'はちにんこ' ? '✅ OK' : '❌ NG');

// 空文字列
console.log('空文字列テスト:', reverseText('') === '' ? '✅ OK' : '❌ NG');

console.log('テスト終了'); 