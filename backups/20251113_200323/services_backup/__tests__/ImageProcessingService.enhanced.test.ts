/**
 * 增強圖片處理服務測試
 * 測試新增的特徵提取、智能裁剪和質量增強功能
 */

import { ImageProcessingService } from '../ImageProcessingService';
import sharp from 'sharp';

describe('ImageProcessingService - Enhanced Features', () => {
  let service: ImageProcessingService;

  beforeEach(() => {
    service = new ImageProcessingService();
  });

  describe('extractImageFeatures', () => {
    it('應該能提取圖片特徵', async () => {
      // 創建一個測試圖片
      const testImage = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 255, g: 100, b: 50 }
        }
      })
        .jpeg()
        .toBuffer();

      const features = await service.extractImageFeatures(testImage);

      expect(features).toBeDefined();
      expect(features.dominantColors).toBeInstanceOf(Array);
      expect(features.brightness).toBeGreaterThanOrEqual(0);
      expect(features.brightness).toBeLessThanOrEqual(1);
      expect(features.contrast).toBeGreaterThanOrEqual(0);
      expect(features.contrast).toBeLessThanOrEqual(1);
      expect(features.sharpness).toBeGreaterThanOrEqual(0);
      expect(features.sharpness).toBeLessThanOrEqual(1);
      expect(typeof features.hasMultipleObjects).toBe('boolean');
    });
  });

  describe('smartCrop', () => {
    it('應該能執行智能裁剪', async () => {
      // 創建一個測試圖片
      const testImage = await sharp({
        create: {
          width: 1200,
          height: 900,
          channels: 3,
          background: { r: 200, g: 200, b: 200 }
        }
      })
        .jpeg()
        .toBuffer();

      const croppedBuffer = await service.smartCrop(testImage, 800, 600);

      expect(croppedBuffer).toBeInstanceOf(Buffer);
      expect(croppedBuffer.length).toBeGreaterThan(0);

      // 驗證裁剪後的尺寸
      const metadata = await sharp(croppedBuffer).metadata();
      expect(metadata.width).toBe(800);
      expect(metadata.height).toBe(600);
    });
  });

  describe('enhanceImage', () => {
    it('應該能增強圖片質量', async () => {
      // 創建一個測試圖片
      const testImage = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 150, g: 150, b: 150 }
        }
      })
        .jpeg()
        .toBuffer();

      const enhancedBuffer = await service.enhanceImage(testImage);

      expect(enhancedBuffer).toBeInstanceOf(Buffer);
      expect(enhancedBuffer.length).toBeGreaterThan(0);
    });
  });

  describe('processImage - Enhanced Options', () => {
    it('應該能使用增強選項處理圖片', async () => {
      // 創建一個測試圖片
      const testImage = await sharp({
        create: {
          width: 1200,
          height: 900,
          channels: 3,
          background: { r: 200, g: 150, b: 100 }
        }
      })
        .jpeg()
        .toBuffer();

      const result = await service.processImage(testImage, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 85,
        format: 'jpeg',
        enableSmartCrop: true,
        extractFeatures: true,
        enhanceQuality: true
      });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.features).toBeDefined();
      expect(result.metadata.features?.dominantColors).toBeInstanceOf(Array);
      expect(result.metadata.processedSize).toBeLessThan(result.metadata.originalSize || 0);
    });

    it('應該能在不啟用增強功能時正常處理', async () => {
      const testImage = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 100, g: 100, b: 100 }
        }
      })
        .jpeg()
        .toBuffer();

      const result = await service.processImage(testImage, {
        maxWidth: 640,
        maxHeight: 480,
        quality: 80,
        format: 'jpeg',
        enableSmartCrop: false,
        extractFeatures: false,
        enhanceQuality: false
      });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.features).toBeUndefined();
    });
  });
});
