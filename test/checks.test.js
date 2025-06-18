const checks = require('../src/checks');

const sampleText = `
現状、我々のKPIはしっかりと達成できていません。これを改善するために、頑張ります。今後は最大限努力します。\n\nこのような形で、適切に進めていきたいと思います。`;

console.log('=== サンプル文章 ===');
console.log(sampleText);
console.log('\n=== チェック結果 ===');

const results = {};
for (const [key, fn] of Object.entries(checks)) {
  results[key] = fn(sampleText);
}

for (const [key, issues] of Object.entries(results)) {
  if (issues.length > 0) {
    console.log(`\n【${key}】`);
    issues.forEach(issue => console.log(' - ' + issue));
  }
} 