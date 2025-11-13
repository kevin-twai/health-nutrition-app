import AWS from 'aws-sdk';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface ImageUploadResult {
  imageId: string;
  originalUrl: string;
  processedUrl: string;
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  originalSize: number;
  processedSize: number;
  width: number;
  height: number;
  format: string;
  uploadedAt: Date;
  features?: ImageFeatures;
}

export interface ImageFeatures {
  dominantColors: string[];
  brightness: number;
  contrast: number;
  sharpness: number;
  hasMultipleObjects: boolean;
  estimatedFoodRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  enableSmartCrop?: boolean;
  extractFeatures?: boolean;
  enhanceQuality?: boolean;
}

export class ImageProcessingService {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    // 初始化 AWS S3
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.bucketName = process.env.AWS_S3_BUCKET || 'health-tracker-images';
  }

  /**
   * 驗證圖片格式
   */
  validateImageFormat(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/heic',
      'image/heif'
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.heic', '.heif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    return allowedMimeTypes.includes(file.mimetype) && 
           allowedExtensions.includes(fileExtension);
  }

  /**
   * 驗證圖片大小
   */
  validateImageSize(file: Express.Multer.File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  }

  /**
   * 提取圖片特徵
   */
  async extractImageFeatures(buffer: Buffer): Promise<ImageFeatures> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      const stats = await image.stats();

      // 提取主要顏色
      const dominantColors = this.extractDominantColors(stats);

      // 計算亮度（基於統計數據）
      const brightness = this.calculateBrightness(stats);

      // 估算對比度
      const contrast = this.calculateContrast(stats);

      // 估算清晰度（基於圖片尺寸和格式）
      const sharpness = this.estimateSharpness(metadata);

      // 簡單判斷是否有多個物體（基於圖片複雜度）
      const hasMultipleObjects = this.estimateMultipleObjects(stats);

      return {
        dominantColors,
        brightness,
        contrast,
        sharpness,
        hasMultipleObjects
      };
    } catch (error) {
      console.error('特徵提取錯誤:', error);
      // 返回預設值
      return {
        dominantColors: [],
        brightness: 0.5,
        contrast: 0.5,
        sharpness: 0.5,
        hasMultipleObjects: false
      };
    }
  }

  /**
   * 提取主要顏色
   */
  private extractDominantColors(stats: sharp.Stats): string[] {
    const colors: string[] = [];
    
    // 基於 RGB 通道的平均值判斷主要顏色
    const channels = stats.channels;
    if (channels.length >= 3) {
      const r = channels[0].mean;
      const g = channels[1].mean;
      const b = channels[2].mean;

      // 判斷主要顏色傾向
      if (r > 180 && g < 100 && b < 100) colors.push('紅色');
      if (r < 100 && g > 180 && b < 100) colors.push('綠色');
      if (r < 100 && g < 100 && b > 180) colors.push('藍色');
      if (r > 200 && g > 180 && b < 100) colors.push('黃色');
      if (r > 200 && g > 200 && b > 200) colors.push('白色');
      if (r < 80 && g < 80 && b < 80) colors.push('黑色');
      if (r > 150 && g > 100 && b < 80) colors.push('棕色');
      if (r > 100 && g > 100 && b > 100 && r < 180 && g < 180 && b < 180) colors.push('灰色');
    }

    return colors.length > 0 ? colors : ['混合色'];
  }

  /**
   * 計算亮度
   */
  private calculateBrightness(stats: sharp.Stats): number {
    const channels = stats.channels;
    if (channels.length >= 3) {
      const avgBrightness = (channels[0].mean + channels[1].mean + channels[2].mean) / 3;
      return avgBrightness / 255; // 標準化到 0-1
    }
    return 0.5;
  }

  /**
   * 計算對比度
   */
  private calculateContrast(stats: sharp.Stats): number {
    const channels = stats.channels;
    if (channels.length >= 3) {
      // 使用標準差作為對比度的指標
      const avgStdDev = (channels[0].stdev + channels[1].stdev + channels[2].stdev) / 3;
      return Math.min(avgStdDev / 128, 1); // 標準化到 0-1
    }
    return 0.5;
  }

  /**
   * 估算清晰度
   */
  private estimateSharpness(metadata: sharp.Metadata): number {
    // 基於圖片尺寸估算清晰度
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const pixels = width * height;
    
    if (pixels > 2000000) return 0.9; // 高解析度
    if (pixels > 1000000) return 0.7; // 中等解析度
    if (pixels > 500000) return 0.5; // 低解析度
    return 0.3; // 很低解析度
  }

  /**
   * 估算是否有多個物體
   */
  private estimateMultipleObjects(stats: sharp.Stats): boolean {
    // 基於顏色分布的複雜度判斷
    const channels = stats.channels;
    if (channels.length >= 3) {
      const avgStdDev = (channels[0].stdev + channels[1].stdev + channels[2].stdev) / 3;
      // 如果標準差較大，可能有多個物體
      return avgStdDev > 60;
    }
    return false;
  }

  /**
   * 智能裁剪（聚焦食物區域）
   */
  async smartCrop(buffer: Buffer, targetWidth: number, targetHeight: number): Promise<Buffer> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // 使用 sharp 的 attention 策略進行智能裁剪
      // 這會自動檢測圖片中的重要區域（通常是食物）
      const croppedBuffer = await image
        .resize(targetWidth, targetHeight, {
          fit: 'cover',
          position: 'attention' // 智能定位到重要區域
        })
        .toBuffer();

      console.log(`智能裁剪完成: ${metadata.width}x${metadata.height} -> ${targetWidth}x${targetHeight}`);
      return croppedBuffer;
    } catch (error) {
      console.error('智能裁剪錯誤:', error);
      // 如果失敗，使用中心裁剪
      return await sharp(buffer)
        .resize(targetWidth, targetHeight, {
          fit: 'cover',
          position: 'centre'
        })
        .toBuffer();
    }
  }

  /**
   * 增強圖片質量
   */
  async enhanceImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .normalize() // 標準化亮度和對比度
        .sharpen() // 銳化
        .toBuffer();
    } catch (error) {
      console.error('圖片增強錯誤:', error);
      return buffer;
    }
  }

  /**
   * 處理和壓縮圖片（增強版）
   */
  async processImage(
    buffer: Buffer, 
    options: ImageProcessingOptions = {}
  ): Promise<{ buffer: Buffer; metadata: Partial<ImageMetadata> }> {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 85,
      format = 'jpeg',
      enableSmartCrop = false,
      extractFeatures = false,
      enhanceQuality = false
    } = options;

    try {
      let processedBuffer = buffer;

      // 1. 圖片增強（如果啟用）
      if (enhanceQuality) {
        console.log('🎨 增強圖片質量...');
        processedBuffer = await this.enhanceImage(processedBuffer);
      }

      // 2. 智能裁剪（如果啟用）
      if (enableSmartCrop) {
        console.log('✂️ 執行智能裁剪...');
        processedBuffer = await this.smartCrop(processedBuffer, maxWidth, maxHeight);
      }

      // 3. 標準處理
      let sharpInstance = sharp(processedBuffer);
      
      // 獲取原始圖片資訊
      const originalMetadata = await sharpInstance.metadata();
      
      // 如果沒有智能裁剪，則調整大小並保持比例
      if (!enableSmartCrop) {
        sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // 4. 轉換格式和優化壓縮
      let finalBuffer: Buffer;
      switch (format) {
        case 'jpeg':
          finalBuffer = await sharpInstance
            .jpeg({ 
              quality, 
              progressive: true,
              mozjpeg: true // 使用 mozjpeg 獲得更好的壓縮
            })
            .toBuffer();
          break;
        case 'png':
          finalBuffer = await sharpInstance
            .png({ 
              quality, 
              progressive: true,
              compressionLevel: 9 // 最高壓縮級別
            })
            .toBuffer();
          break;
        case 'webp':
          finalBuffer = await sharpInstance
            .webp({ 
              quality,
              effort: 6 // 更高的壓縮努力
            })
            .toBuffer();
          break;
        default:
          finalBuffer = await sharpInstance
            .jpeg({ 
              quality, 
              progressive: true,
              mozjpeg: true
            })
            .toBuffer();
      }

      // 5. 獲取處理後的圖片資訊
      const processedMetadata = await sharp(finalBuffer).metadata();

      // 6. 提取圖片特徵（如果啟用）
      let features: ImageFeatures | undefined;
      if (extractFeatures) {
        console.log('🔍 提取圖片特徵...');
        features = await this.extractImageFeatures(finalBuffer);
      }

      const compressionRatio = ((buffer.length - finalBuffer.length) / buffer.length * 100).toFixed(1);
      console.log(`✅ 圖片處理完成: ${buffer.length} -> ${finalBuffer.length} bytes (壓縮 ${compressionRatio}%)`);

      return {
        buffer: finalBuffer,
        metadata: {
          originalSize: buffer.length,
          processedSize: finalBuffer.length,
          width: processedMetadata.width || 0,
          height: processedMetadata.height || 0,
          format: format,
          features
        }
      };
    } catch (error) {
      throw new Error(`圖片處理失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 上傳圖片到 S3
   */
  async uploadToS3(
    buffer: Buffer, 
    fileName: string, 
    contentType: string
  ): Promise<string> {
    const key = `food-images/${Date.now()}-${fileName}`;
    
    try {
      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
        Metadata: {
          uploadedAt: new Date().toISOString(),
          service: 'health-nutrition-tracker'
        }
      };

      const result = await this.s3.upload(uploadParams).promise();
      return result.Location;
    } catch (error) {
      throw new Error(`S3 上傳失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 完整的圖片上傳和處理流程
   */
  async uploadAndProcessImage(
    file: Express.Multer.File,
    options: ImageProcessingOptions = {}
  ): Promise<ImageUploadResult> {
    // 驗證圖片
    if (!this.validateImageFormat(file)) {
      throw new Error('不支援的圖片格式。請使用 JPEG、PNG 或 HEIC 格式。');
    }

    if (!this.validateImageSize(file)) {
      throw new Error('圖片大小超過限制 (10MB)。');
    }

    try {
      const imageId = uuidv4();
      
      // 處理原始圖片
      const { buffer: processedBuffer, metadata } = await this.processImage(
        file.buffer, 
        options
      );

      // 上傳原始圖片
      const originalUrl = await this.uploadToS3(
        file.buffer,
        `original-${imageId}-${file.originalname}`,
        file.mimetype
      );

      // 上傳處理後的圖片
      const processedUrl = await this.uploadToS3(
        processedBuffer,
        `processed-${imageId}-${file.originalname}`,
        `image/${options.format || 'jpeg'}`
      );

      return {
        imageId,
        originalUrl,
        processedUrl,
        metadata: {
          ...metadata,
          uploadedAt: new Date()
        } as ImageMetadata
      };
    } catch (error) {
      throw new Error(`圖片上傳處理失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 刪除 S3 中的圖片
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const key = imageUrl.split('/').slice(-2).join('/'); // 提取 key
      
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();
    } catch (error) {
      throw new Error(`圖片刪除失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 生成預簽名 URL 用於直接上傳
   */
  async generatePresignedUrl(fileName: string, contentType: string): Promise<string> {
    const key = `food-images/${Date.now()}-${fileName}`;
    
    try {
      const signedUrl = await this.s3.getSignedUrlPromise('putObject', {
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        Expires: 300, // 5 分鐘過期
        ACL: 'public-read'
      });

      return signedUrl;
    } catch (error) {
      throw new Error(`預簽名 URL 生成失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }
}