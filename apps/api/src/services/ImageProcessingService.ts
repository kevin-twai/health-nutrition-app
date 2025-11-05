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
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
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
   * 處理和壓縮圖片
   */
  async processImage(
    buffer: Buffer, 
    options: ImageProcessingOptions = {}
  ): Promise<{ buffer: Buffer; metadata: Partial<ImageMetadata> }> {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 85,
      format = 'jpeg'
    } = options;

    try {
      let sharpInstance = sharp(buffer);
      
      // 獲取原始圖片資訊
      const originalMetadata = await sharpInstance.metadata();
      
      // 調整大小並保持比例
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });

      // 轉換格式和壓縮
      let processedBuffer: Buffer;
      switch (format) {
        case 'jpeg':
          processedBuffer = await sharpInstance
            .jpeg({ quality, progressive: true })
            .toBuffer();
          break;
        case 'png':
          processedBuffer = await sharpInstance
            .png({ quality, progressive: true })
            .toBuffer();
          break;
        case 'webp':
          processedBuffer = await sharpInstance
            .webp({ quality })
            .toBuffer();
          break;
        default:
          processedBuffer = await sharpInstance
            .jpeg({ quality, progressive: true })
            .toBuffer();
      }

      // 獲取處理後的圖片資訊
      const processedMetadata = await sharp(processedBuffer).metadata();

      return {
        buffer: processedBuffer,
        metadata: {
          originalSize: buffer.length,
          processedSize: processedBuffer.length,
          width: processedMetadata.width || 0,
          height: processedMetadata.height || 0,
          format: format
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