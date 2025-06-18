#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const checks = require('./checks');

function runChecks(text) {
  const results = {};
  for (const [key, fn] of Object.entries(checks)) {
    results[key] = fn(text);
  }
  return results;
}

function printResults(results) {
  let hasIssue = false;
  for (const [key, issues] of Object.entries(results)) {
    if (issues.length > 0) {
      hasIssue = true;
      console.log(`\n【${key}】`);
      issues.forEach(issue => console.log(' - ' + issue));
    }
  }
  if (!hasIssue) {
    console.log('全ての観点で問題は見つかりませんでした。');
  }
}

// コマンドライン引数でファイル指定 or 標準入力
const fileArg = process.argv[2];
if (fileArg) {
  const filePath = path.resolve(process.cwd(), fileArg);
  const text = fs.readFileSync(filePath, 'utf8');
  const results = runChecks(text);
  printResults(results);
} else {
  // 標準入力から受け取る
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', () => {
    const results = runChecks(input);
    printResults(results);
  });
} 