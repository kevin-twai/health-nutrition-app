#!/usr/bin/env python3
"""
測試生蠔圖片辨識
使用方式: python3 test-oyster.py [圖片路徑]
"""

import sys
import requests
import json
from pathlib import Path

def test_image(image_path):
    """測試圖片辨識"""
    
    # 檢查檔案是否存在
    if not Path(image_path).exists():
        print(f"❌ 找不到圖片: {image_path}")
        return
    
    print("🦪 測試生蠔圖片辨識")
    print("=" * 50)
    print(f"圖片: {image_path}")
    print(f"大小: {Path(image_path).stat().st_size / 1024:.2f} KB")
    print()
    
    # API 端點
    api_url = "https://health-nutrition-app-w3zm.onrender.com/api/v1/photo/recognize"
    
    # 準備請求
    with open(image_path, 'rb') as f:
        files = {'photo': f}
        data = {
            'maxResults': '10',
            'minConfidence': '0.3',
            'language': 'zh-TW'
        }
        
        print("📤 發送請求到 API...")
        print(f"🔗 URL: {api_url}")
        print()
        
        try:
            response = requests.post(api_url, files=files, data=data, timeout=30)
            
            print(f"📥 收到回應")
            print(f"狀態碼: {response.status_code}")
            print()
            
            if response.status_code == 200:
                result = response.json()
                
                # 顯示基本資訊
                print("✅ 辨識成功")
                print(f"使用 API: {result.get('data', {}).get('apiUsed', '未知')}")
                print(f"處理時間: {result.get('data', {}).get('processingTime', 0)}ms")
                print()
                
                # 顯示辨識結果
                suggestions = result.get('data', {}).get('recognition', {}).get('suggestions', [])
                if suggestions:
                    print(f"🍽️  辨識出 {len(suggestions)} 種食材:")
                    print("-" * 50)
                    for i, item in enumerate(suggestions, 1):
                        food = item.get('food', {})
                        confidence = item.get('confidence', 0) * 100
                        print(f"{i}. {food.get('name', '未知')}")
                        print(f"   信心度: {confidence:.1f}%")
                        print(f"   熱量: {food.get('calories', 0)} 卡")
                        print(f"   蛋白質: {food.get('protein', 0)}g")
                        print(f"   碳水: {food.get('carbs', 0)}g")
                        print(f"   脂肪: {food.get('fat', 0)}g")
                        print()
                else:
                    print("⚠️  沒有辨識到任何食材")
                
                # 顯示完整回應
                print("📄 完整 API 回應:")
                print("-" * 50)
                print(json.dumps(result, indent=2, ensure_ascii=False))
                
            else:
                print(f"❌ API 回應錯誤: {response.status_code}")
                print(response.text)
                
        except requests.exceptions.Timeout:
            print("❌ 請求超時（30秒）")
        except requests.exceptions.RequestException as e:
            print(f"❌ 請求失敗: {e}")
        except json.JSONDecodeError:
            print("❌ 無法解析 JSON 回應")
            print(response.text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("使用方式: python3 test-oyster.py [圖片路徑]")
        print()
        print("範例:")
        print("  python3 test-oyster.py oyster.jpg")
        print("  python3 test-oyster.py ~/Downloads/oyster-image.jpg")
        sys.exit(1)
    
    image_path = sys.argv[1]
    test_image(image_path)
