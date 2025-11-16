const fs = require('fs');
const path = require('path');

console.log('🔧 Creating missing prerender-manifest.json...');

// 創建 .next 目錄（如果不存在）
const nextDir = path.join(__dirname, '.next');
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
}

// 創建最小的 prerender-manifest.json
const manifest = {
  version: 4,
  routes: {},
  dynamicRoutes: {},
  notFoundRoutes: [],
  preview: {
    previewModeId: 'development-id',
    previewModeSigningKey: 'development-key',
    previewModeEncryptionKey: 'development-encryption-key'
  }
};

fs.writeFileSync(
  path.join(nextDir, 'prerender-manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('✅ Created prerender-manifest.json');
