#!/usr/bin/env python3
"""
互動式生蠔圖片辨識測試
會自動尋找常見的圖片檔案
"""

import os
import sys
import requests
import json
from pathlib import Path
from datetime import datetime

def find_image_files():
    """尋找當前目錄和常見位置的圖片檔案"""
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    locations = [
        Path.cwd(),  # 當前目錄
        Path.home() / 'Downloads',  # 下載資料夾
        Path.home() / 'Desktop',  # 桌面
    ]
    
    found_images = []
    for location in locations:
        if location.exists():
            for ext in image_extensions:
                found_images.extend(location.glob(f'*{ext}'))
                found_images.extend(location.glob(f'*{ext.upper()}'))
    
    return sorted(set(found_images), key=lambda x: x.stat().st_mtime, reverse=True)[:20]

def format_size(size_bytes):
    """格式化檔案大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"

def test_image(image_path):
    """測試圖片辨識"""
    
    print("\n" + "=" * 70)
    print("🦪 生蠔圖片辨識測試")
    print("=" * 70)
    print(f"📁 圖片: {image_path}")
    print(f"📏 大小: {format_size(Path(image_path).stat().st_size)}")
    print(f"🕐 時間: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
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
        
        print("📤 發送請求到遠端 API...")
        print(f"🔗 {api_url}")
        print()
        
        try:
            print("⏳ 等待回應中...")
            response = requests.post(api_url, files=files, data=data, timeout=60)
            
            print(f"✅ 收到回應 (HTTP {response.status_code})")
            print()
            
            if response.status_code == 200:
                result = response.json()
                
                # 顯示 API 資訊
                api_used = result.get('data', {}).get('apiUsed', '未知')
                processing_time = result.get('data', {}).get('processingTime', 0)
                
                print("=" * 70)
                print("📊 辨識結果")
                print("=" * 70)
                print(f"🤖 使用 API: {api_used}")
                print(f"⏱️  處理時間: {processing_time}ms")
                print()
                
                # 檢查是否使用 OpenAI Vision API
                if api_used == 'ChatGPT Vision API':
                    print("✅ 成功使用 OpenAI Vision API！")
                else:
                    print(f"⚠️  警告: 使用的是 {api_used}（可能是回退機制）")
                print()
                
                # 顯示辨識的食材
                suggestions = result.get('data', {}).get('recognition', {}).get('suggestions', [])
                if suggestions:
                    print(f"🍽️  辨識出 {len(suggestions)} 種食材:")
                    print("-" * 70)
                    
                    for i, item in enumerate(suggestions, 1):
                        food = item.get('food', {})
                        confidence = item.get('confidence', 0) * 100
                        
                        print(f"\n{i}. {food.get('name', '未知')} (信心度: {confidence:.1f}%)")
                        print(f"   ├─ 熱量: {food.get('calories', 0)} 卡")
                        print(f"   ├─ 蛋白質: {food.get('protein', 0)}g")
                        print(f"   ├─ 碳水化合物: {food.get('carbs', 0)}g")
                        print(f"   └─ 脂肪: {food.get('fat', 0)}g")
                    
                    print()
                    print("-" * 70)
                    
                    # 總營養資訊
                    total_nutrition = result.get('data', {}).get('nutrition', {})
                    if total_nutrition:
                        print("\n📊 總營養資訊:")
                        print(f"   總熱量: {total_nutrition.get('calories', 0)} 卡")
                        print(f"   總蛋白質: {total_nutrition.get('protein', 0)}g")
                        print(f"   總碳水: {total_nutrition.get('carbohydrates', 0)}g")
                        print(f"   總脂肪: {total_nutrition.get('fat', 0)}g")
                else:
                    print("⚠️  沒有辨識到任何食材")
                
                print()
                print("=" * 70)
                print("📄 完整 API 回應")
                print("=" * 70)
                print(json.dumps(result, indent=2, ensure_ascii=False))
                print("=" * 70)
                
                return True
                
            else:
                print(f"❌ API 回應錯誤: HTTP {response.status_code}")
                print(response.text)
                return False
                
        except requests.exceptions.Timeout:
            print("❌ 請求超時（60秒）")
            print("提示: API 可能正在冷啟動，請稍後再試")
            return False
        except requests.exceptions.RequestException as e:
            print(f"❌ 請求失敗: {e}")
            return False
        except json.JSONDecodeError:
            print("❌ 無法解析 JSON 回應")
            print(response.text)
            return False
        except Exception as e:
            print(f"❌ 發生錯誤: {e}")
            return False

def main():
    print("🦪 生蠔圖片辨識測試工具")
    print()
    
    # 如果有命令列參數，直接使用
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        if not Path(image_path).exists():
            print(f"❌ 找不到圖片: {image_path}")
            sys.exit(1)
        test_image(image_path)
        return
    
    # 尋找圖片檔案
    print("🔍 正在尋找圖片檔案...")
    images = find_image_files()
    
    if not images:
        print("❌ 找不到任何圖片檔案")
        print()
        print("請使用以下方式:")
        print("  python3 test-oyster-interactive.py /path/to/image.jpg")
        sys.exit(1)
    
    print(f"✅ 找到 {len(images)} 個圖片檔案")
    print()
    print("請選擇要測試的圖片:")
    print("-" * 70)
    
    for i, img in enumerate(images, 1):
        size = format_size(img.stat().st_size)
        mtime = datetime.fromtimestamp(img.stat().st_mtime).strftime('%Y-%m-%d %H:%M')
        print(f"{i:2d}. {img.name:40s} ({size:>10s}) [{mtime}]")
    
    print("-" * 70)
    print()
    
    try:
        choice = input("請輸入編號 (或按 Enter 取消): ").strip()
        if not choice:
            print("已取消")
            return
        
        idx = int(choice) - 1
        if 0 <= idx < len(images):
            test_image(images[idx])
        else:
            print("❌ 無效的編號")
    except ValueError:
        print("❌ 請輸入有效的數字")
    except KeyboardInterrupt:
        print("\n\n已取消")

if __name__ == "__main__":
    main()
