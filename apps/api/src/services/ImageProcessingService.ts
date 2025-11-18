import { v2 as cloudinary } from 'cloudinary';
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
  private folder: string;

  constructor() {
    // 初始化 Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    
    this.folder = 'health-nutrition-app/food-images';
    
    console.log('✓ Cloudinary 已初始化');
    console.log(`  - Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`  - Folder: ${this.folder}`);
  }

  /**
   * 驗證圖片格式
   */
  validateImageFormat(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'application/octet-stream' // curl 可能使用此類型
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // 檢查是否為不支援的 HEIC 格式
    const isHEIC = fileExtension === '.heic' || fileExtension === '.heif' || 
                   file.mimetype === 'image/heic' || file.mimetype === 'image/heif';
    
    if (isHEIC) {
      return false; // 明確拒絕 HEIC 格式
    }
    
    // 如果 MIME 類型是 application/octet-stream，只檢查擴展名
    if (file.mimetype === 'application/octet-stream') {
      return allowedExtensions.includes(fileExtension);
    }
    
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

      // 計算亮度
      const brightness = this.calculateBrightness(stats);

      // 計算對比度
      const contrast = this.calculateContrast(stats);

      // 計算清晰度
      const sharpness = await this.calculateSharpness(image);

      return {
        dominantColors,
        brightness,
        contrast,
        sharpness,
        hasMultipleObjects: false // 簡化版本
      };
    } catch (error) {
      console.error('提取圖片特徵失敗:', error);
      return {
        dominantColors: [],
        brightness: 0,
        contrast: 0,
        sharpness: 0,
        hasMultipleObjects: false
      };
    }
  }

  /**
   * 提取主要顏色
   */
  private extractDominantColors(stats: sharp.Stats): string[] {
    const colors: string[] = [];
    
    // 從統計數據中提取主要顏色
    const channels = stats.channels;
    if (channels && channels.length >= 3) {
      const r = Math.round(channels[0].mean);
      const g = Math.round(channels[1].mean);
      const b = Math.round(channels[2].mean);
      colors.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    }
    
    return colors;
  }

  /**
   * 計算亮度
   */
  private calculateBrightness(stats: sharp.Stats): number {
    const channels = stats.channels;
    if (!channels || channels.length === 0) return 0;
    
    const avgBrightness = channels.reduce((sum, channel) => sum + channel.mean, 0) / channels.length;
    return avgBrightness / 255; // 歸一化到 0-1
  }

  /**
   * 計算對比度
   */
  private calculateContrast(stats: sharp.Stats): number {
    const channels = stats.channels;
    if (!channels || channels.length === 0) return 0;
    
    const avgStdDev = channels.reduce((sum, channel) => sum + channel.stdev, 0) / channels.length;
    return avgStdDev / 128; // 歸一化到 0-1
  }

  /**
   * 計算清晰度
   */
  private async calculateSharpness(image: sharp.Sharp): Promise<number> {
    try {
      const stats = await image.stats();
      const channels = stats.channels;
      if (!channels || channels.length === 0) return 0;
      
      // 使用標準差作為清晰度的簡單指標
      const avgStdDev = channels.reduce((sum, channel) => sum + channel.stdev, 0) / channels.length;
      return Math.min(avgStdDev / 50, 1); // 歸一化到 0-1
    } catch (error) {
      return 0;
    }
  }

  /**
   * 上傳並處理圖片（使用 Cloudinary）
   */
  async uploadAndProcessImage(
    file: Express.Multer.File,
    options: ImageProcessingOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      // 驗證圖片
      if (!this.validateImageFormat(file)) {
        throw new Error('不支援的圖片格式');
      }

      if (!this.validateImageSize(file)) {
        throw new Error('圖片大小超過限制 (10MB)');
      }

      // 生成唯一 ID
      const imageId = uuidv4();
      const timestamp = Date.now();

      // 處理圖片
      let processedBuffer = file.buffer;
      let processedMetadata = {
        width: 0,
        height: 0,
        format: 'jpeg' as const,
        size: file.size
      };

      // 檢查是否為 HEIC/HEIF 格式
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const isHEIC = fileExtension === '.heic' || fileExtension === '.heif' || 
                     file.mimetype === 'image/heic' || file.mimetype === 'image/heif';

      // HEIC 格式需要特殊處理
      if (isHEIC) {
        console.log('⚠️ 檢測到 HEIC/HEIF 格式');
        throw new Error('目前不支援 HEIC/HEIF 格式。請將照片轉換為 JPEG 或 PNG 格式後再上傳。\n\niPhone 用戶可以在「設定 > 相機 > 格式」中選擇「最相容」來拍攝 JPEG 格式照片。');
      }

      // 使用 sharp 處理圖片
      const image = sharp(file.buffer);
      const metadata = await image.metadata();

      // 調整大小和質量
      if (options.maxWidth || options.maxHeight || options.quality) {
        const resizeOptions: sharp.ResizeOptions = {};
        if (options.maxWidth) resizeOptions.width = options.maxWidth;
        if (options.maxHeight) resizeOptions.height = options.maxHeight;
        resizeOptions.fit = 'inside';
        resizeOptions.withoutEnlargement = true;

        processedBuffer = await image
          .resize(resizeOptions)
          .jpeg({ quality: options.quality || 85 })
          .toBuffer();

        const processedImage = sharp(processedBuffer);
        const processedMeta = await processedImage.metadata();
        processedMetadata = {
          width: processedMeta.width || 0,
          height: processedMeta.height || 0,
          format: 'jpeg',
          size: processedBuffer.length
        };
      } else {
        processedMetadata = {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: 'jpeg',
          size: file.size
        };
      }

      // 提取圖片特徵（如果需要）
      let features: ImageFeatures | undefined;
      if (options.extractFeatures) {
        features = await this.extractImageFeatures(processedBuffer);
      }

      // 上傳到 Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: this.folder,
            public_id: `${imageId}_${timestamp}`,
            resource_type: 'image',
            transformation: [
              {
                quality: 'auto',
                fetch_format: 'auto'
              }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(processedBuffer);
      });

      console.log('✓ 圖片已上傳到 Cloudinary:', uploadResult.public_id);

      // 構建回應
      const result: ImageUploadResult = {
        imageId,
        originalUrl: uploadResult.secure_url,
        processedUrl: uploadResult.secure_url,
        metadata: {
          originalSize: file.size,
          processedSize: processedMetadata.size,
          width: processedMetadata.width,
          height: processedMetadata.height,
          format: processedMetadata.format,
          uploadedAt: new Date(),
          features
        }
      };

      return result;
    } catch (error) {
      console.error('圖片上傳處理失敗:', error);
      throw new Error(`圖片上傳處理失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 生成預簽名上傳 URL（Cloudinary 版本）
   */
  async generatePresignedUrl(
    fileName: string,
    contentType: string
  ): Promise<string> {
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const publicId = `${this.folder}/${uuidv4()}_${Date.now()}`;

      // 生成簽名
      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder: this.folder,
          public_id: publicId
        },
        process.env.CLOUDINARY_API_SECRET!
      );

      // 構建上傳 URL
      const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

      return uploadUrl;
    } catch (error) {
      console.error('生成預簽名 URL 失敗:', error);
      throw new Error(`生成預簽名 URL 失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 刪除圖片
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // 從 URL 中提取 public_id
      const urlParts = imageUrl.split('/');
      const fileNameWithExt = urlParts[urlParts.length - 1];
      const fileName = fileNameWithExt.split('.')[0];
      const publicId = `${this.folder}/${fileName}`;

      // 從 Cloudinary 刪除
      await cloudinary.uploader.destroy(publicId);

      console.log('✓ 圖片已從 Cloudinary 刪除:', publicId);
    } catch (error) {
      console.error('刪除圖片失敗:', error);
      throw new Error(`刪除圖片失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 獲取圖片 URL（帶轉換）
   */
  getImageUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }): string {
    return cloudinary.url(publicId, {
      secure: true,
      ...options
    });
  }

  /**
   * 健康檢查
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      // 檢查 Cloudinary 配置
      if (!process.env.CLOUDINARY_CLOUD_NAME || 
          !process.env.CLOUDINARY_API_KEY || 
          !process.env.CLOUDINARY_API_SECRET) {
        return {
          status: 'unhealthy',
          message: 'Cloudinary 環境變數未配置'
        };
      }

      // 嘗試獲取資源列表（測試連接）
      await cloudinary.api.resources({
        type: 'upload',
        prefix: this.folder,
        max_results: 1
      });

      return {
        status: 'healthy',
        message: 'Cloudinary 連接正常'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Cloudinary 連接失敗: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
