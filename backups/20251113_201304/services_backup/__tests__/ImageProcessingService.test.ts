import { ImageProcessingService } from '../ImageProcessingService';
import AWS from 'aws-sdk';
import sharp from 'sharp';

// Mock AWS S3
jest.mock('aws-sdk');
const mockS3 = {
  upload: jest.fn(),
  deleteObject: jest.fn(),
  getSignedUrlPromise: jest.fn()
};
(AWS.S3 as unknown as jest.Mock).mockImplementation(() => mockS3);

// Mock sharp
jest.mock('sharp');
const mockSharp = sharp as jest.MockedFunction<typeof sharp>;

describe('ImageProcessingService', () => {
  let imageProcessingService: ImageProcessingService;
  let mockFile: Express.Multer.File;

  beforeEach(() => {
    imageProcessingService = new ImageProcessingService();
    
    // 重置所有 mocks
    jest.clearAllMocks();
    
    // 設定環境變數
    process.env.AWS_S3_BUCKET = 'test-bucket';
    process.env.AWS_REGION = 'us-east-1';
    
    // 建立模擬檔案
    mockFile = {
      fieldname: 'photo',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      buffer: Buffer.from('fake-image-data'),
      destination: '',
      filename: '',
      path: '',
      stream: {} as any
    };
  });

  describe('validateImageFormat', () => {
    it('應該接受有效的圖片格式', () => {
      const validFormats = [
        { mimetype: 'image/jpeg', originalname: 'test.jpg' },
        { mimetype: 'image/png', originalname: 'test.png' },
        { mimetype: 'image/heic', originalname: 'test.heic' }
      ];

      validFormats.forEach(format => {
        const file = { ...mockFile, ...format };
        expect(imageProcessingService.validateImageFormat(file)).toBe(true);
      });
    });

    it('應該拒絕無效的圖片格式', () => {
      const invalidFormats = [
        { mimetype: 'image/gif', originalname: 'test.gif' },
        { mimetype: 'text/plain', originalname: 'test.txt' },
        { mimetype: 'image/jpeg', originalname: 'test.pdf' }
      ];

      invalidFormats.forEach(format => {
        const file = { ...mockFile, ...format };
        expect(imageProcessingService.validateImageFormat(file)).toBe(false);
      });
    });
  });

  describe('validateImageSize', () => {
    it('應該接受符合大小限制的檔案', () => {
      const validFile = { ...mockFile, size: 5 * 1024 * 1024 }; // 5MB
      expect(imageProcessingService.validateImageSize(validFile)).toBe(true);
    });

    it('應該拒絕超過大小限制的檔案', () => {
      const invalidFile = { ...mockFile, size: 15 * 1024 * 1024 }; // 15MB
      expect(imageProcessingService.validateImageSize(invalidFile)).toBe(false);
    });
  });

  describe('processImage', () => {
    beforeEach(() => {
      // Mock sharp 鏈式調用
      const mockSharpInstance = {
        metadata: jest.fn().mockResolvedValue({
          width: 2000,
          height: 1500,
          format: 'jpeg'
        }),
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        png: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image-data'))
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);
    });

    it('應該成功處理圖片', async () => {
      const buffer = Buffer.from('test-image-data');
      const options = {
        maxWidth: 800,
        maxHeight: 600,
        quality: 80,
        format: 'jpeg' as const
      };

      const result = await imageProcessingService.processImage(buffer, options);

      expect(result).toHaveProperty('buffer');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('originalSize');
      expect(result.metadata).toHaveProperty('processedSize');
      expect(result.metadata).toHaveProperty('width');
      expect(result.metadata).toHaveProperty('height');
      expect(result.metadata.format).toBe('jpeg');
    });

    it('應該處理不同的圖片格式', async () => {
      const buffer = Buffer.from('test-image-data');
      const formats = ['jpeg', 'png', 'webp'] as const;

      for (const format of formats) {
        const result = await imageProcessingService.processImage(buffer, { format });
        expect(result.metadata.format).toBe(format);
      }
    });

    it('應該在處理失敗時拋出錯誤', async () => {
      const mockSharpInstance = {
        metadata: jest.fn().mockRejectedValue(new Error('Invalid image')),
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockReturnThis()
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);

      const buffer = Buffer.from('invalid-image-data');
      
      await expect(imageProcessingService.processImage(buffer))
        .rejects.toThrow('圖片處理失敗');
    });
  });

  describe('uploadToS3', () => {
    it('應該成功上傳檔案到 S3', async () => {
      const mockUploadResult = {
        Location: 'https://test-bucket.s3.amazonaws.com/food-images/test-image.jpg'
      };

      mockS3.upload.mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockUploadResult)
      });

      const buffer = Buffer.from('test-image-data');
      const fileName = 'test-image.jpg';
      const contentType = 'image/jpeg';

      const result = await imageProcessingService.uploadToS3(buffer, fileName, contentType);

      expect(result).toBe(mockUploadResult.Location);
      expect(mockS3.upload).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'test-bucket',
          Body: buffer,
          ContentType: contentType,
          ACL: 'public-read'
        })
      );
    });

    it('應該在上傳失敗時拋出錯誤', async () => {
      mockS3.upload.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Upload failed'))
      });

      const buffer = Buffer.from('test-image-data');
      const fileName = 'test-image.jpg';
      const contentType = 'image/jpeg';

      await expect(imageProcessingService.uploadToS3(buffer, fileName, contentType))
        .rejects.toThrow('S3 上傳失敗');
    });
  });

  describe('uploadAndProcessImage', () => {
    beforeEach(() => {
      // Mock processImage
      jest.spyOn(imageProcessingService, 'processImage').mockResolvedValue({
        buffer: Buffer.from('processed-image-data'),
        metadata: {
          originalSize: 1024,
          processedSize: 512,
          width: 800,
          height: 600,
          format: 'jpeg'
        }
      });

      // Mock uploadToS3
      jest.spyOn(imageProcessingService, 'uploadToS3')
        .mockResolvedValueOnce('https://example.com/original.jpg')
        .mockResolvedValueOnce('https://example.com/processed.jpg');
    });

    it('應該完成完整的上傳和處理流程', async () => {
      const result = await imageProcessingService.uploadAndProcessImage(mockFile);

      expect(result).toHaveProperty('imageId');
      expect(result).toHaveProperty('originalUrl');
      expect(result).toHaveProperty('processedUrl');
      expect(result).toHaveProperty('metadata');
      expect(result.originalUrl).toBe('https://example.com/original.jpg');
      expect(result.processedUrl).toBe('https://example.com/processed.jpg');
    });

    it('應該在檔案格式無效時拋出錯誤', async () => {
      const invalidFile = { ...mockFile, mimetype: 'text/plain', originalname: 'test.txt' };

      await expect(imageProcessingService.uploadAndProcessImage(invalidFile))
        .rejects.toThrow('不支援的圖片格式');
    });

    it('應該在檔案過大時拋出錯誤', async () => {
      const largeFile = { ...mockFile, size: 15 * 1024 * 1024 }; // 15MB

      await expect(imageProcessingService.uploadAndProcessImage(largeFile))
        .rejects.toThrow('圖片大小超過限制');
    });
  });

  describe('generatePresignedUrl', () => {
    it('應該生成預簽名 URL', async () => {
      const mockPresignedUrl = 'https://test-bucket.s3.amazonaws.com/presigned-url';
      mockS3.getSignedUrlPromise.mockResolvedValue(mockPresignedUrl);

      const fileName = 'test-image.jpg';
      const contentType = 'image/jpeg';

      const result = await imageProcessingService.generatePresignedUrl(fileName, contentType);

      expect(result).toBe(mockPresignedUrl);
      expect(mockS3.getSignedUrlPromise).toHaveBeenCalledWith('putObject', 
        expect.objectContaining({
          Bucket: 'test-bucket',
          ContentType: contentType,
          Expires: 300,
          ACL: 'public-read'
        })
      );
    });

    it('應該在生成失敗時拋出錯誤', async () => {
      mockS3.getSignedUrlPromise.mockRejectedValue(new Error('Failed to generate URL'));

      const fileName = 'test-image.jpg';
      const contentType = 'image/jpeg';

      await expect(imageProcessingService.generatePresignedUrl(fileName, contentType))
        .rejects.toThrow('預簽名 URL 生成失敗');
    });
  });

  describe('deleteImage', () => {
    it('應該成功刪除圖片', async () => {
      mockS3.deleteObject.mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      const imageUrl = 'https://test-bucket.s3.amazonaws.com/food-images/test-image.jpg';

      await expect(imageProcessingService.deleteImage(imageUrl))
        .resolves.not.toThrow();

      expect(mockS3.deleteObject).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'food-images/test-image.jpg'
      });
    });

    it('應該在刪除失敗時拋出錯誤', async () => {
      mockS3.deleteObject.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Delete failed'))
      });

      const imageUrl = 'https://test-bucket.s3.amazonaws.com/food-images/test-image.jpg';

      await expect(imageProcessingService.deleteImage(imageUrl))
        .rejects.toThrow('圖片刪除失敗');
    });
  });
});