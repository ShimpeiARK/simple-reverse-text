#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const checks = require('./checks');
const { validateFilePath } = require('../middleware/inputValidator');

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
  try {
    // ファイルパスの検証（パストラバーサル対策）
    const validatedPath = validateFilePath(fileArg);
    
    // 許可されたディレクトリ内のファイルのみアクセス可能
    const allowedDir = path.resolve(__dirname, '..');
    const resolvedPath = path.resolve(process.cwd(), validatedPath);
    
    // パスが許可されたディレクトリ内にあるかチェック
    if (!resolvedPath.startsWith(allowedDir)) {
      throw new Error('Access to files outside the project directory is not allowed');
    }
    
    // ファイルの存在確認
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${validatedPath}`);
    }
    
    // ファイルの読み込み
    const text = fs.readFileSync(resolvedPath, 'utf8');
    
    // テキストサイズの制限（10MB）
    if (text.length > 10 * 1024 * 1024) {
      throw new Error('File too large (max 10MB)');
    }
    
    const results = runChecks(text);
    printResults(results);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
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