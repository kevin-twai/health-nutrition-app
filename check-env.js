// 檢查環境變數的腳本
require('dotenv').config();

console.log('=== 環境變數檢查 ===');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ 已設定' : '❌ 未設定');
console.log('GOOGLE_VISION_API_KEY:', process.env.GOOGLE_VISION_API_KEY ? '✅ 已設定' : '❌ 未設定');
console.log('NODE_ENV:', process.env.NODE_ENV || '未設定');
console.log('PORT:', process.env.PORT || '未設定');
