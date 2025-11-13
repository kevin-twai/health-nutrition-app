#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 遞歸查找所有 .ts 文件
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳過 node_modules 和 dist
      if (file !== 'node_modules' && file !== 'dist') {
        findTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 計算相對路徑深度
function getRelativePath(filePath) {
  const srcIndex = filePath.indexOf('/src/');
  if (srcIndex === -1) return '../types/shared';
  
  const afterSrc = filePath.substring(srcIndex + 5); // +5 for '/src/'
  const depth = afterSrc.split('/').length - 1;
  
  if (depth === 0) return './types/shared';
  return '../'.repeat(depth) + 'types/shared';
}

// 替換文件中的導入
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // 檢查是否有需要替換的導入
  if (!content.includes("@health-tracker/shared-types")) {
    return false;
  }
  
  const relativePath = getRelativePath(filePath);
  
  // 替換導入語句
  content = content.replace(
    /@health-tracker\/shared-types/g,
    relativePath
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// 主函數
function main() {
  const srcDir = path.join(__dirname, 'src');
  console.log('🔍 查找所有 TypeScript 文件...');
  
  const tsFiles = findTsFiles(srcDir);
  console.log(`📁 找到 ${tsFiles.length} 個 TypeScript 文件`);
  
  let fixedCount = 0;
  
  tsFiles.forEach(file => {
    if (fixImports(file)) {
      fixedCount++;
      const shortPath = file.replace(process.cwd() + '/', '');
      console.log(`✅ 修復: ${shortPath}`);
    }
  });
  
  console.log(`\n🎉 完成！修復了 ${fixedCount} 個文件`);
}

main();
