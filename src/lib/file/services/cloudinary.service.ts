import { ENVEnum } from '@/common/enum/env.enum';
import { AppError } from '@/core/error/handle-error.app';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileType } from '@prisma';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow(ENVEnum.CLOUDINARY_CLOUD_NAME),
      api_key: this.configService.getOrThrow(ENVEnum.CLOUDINARY_API_KEY),
      api_secret: this.configService.getOrThrow(ENVEnum.CLOUDINARY_API_SECRET),
    });
  }

  private async uploadBuffer(
    buffer: Buffer,
    folder: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      );
      uploadStream.end(buffer);
    });
  }

  private async deleteFile(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
  }

  private getFolderByMimeType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.startsWith('audio/')) return 'audios';
    return 'documents';
  }

  private getFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return FileType.image;
    if (mimeType.startsWith('video/')) return FileType.video;
    if (mimeType.startsWith('audio/')) return FileType.audio;
    return FileType.document;
  }

  private getResourceType(mimeType: string): 'image' | 'video' | 'raw' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'raw';
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new AppError(400, 'No file provided or file is empty');
    }

    const fileExt = file.originalname.split('.').pop();
    const folder = this.getFolderByMimeType(file.mimetype);
    const uniqueFileName = `${uuid()}.${fileExt}`;
    const resourceType = this.getResourceType(file.mimetype);

    // Upload to Cloudinary
    const { url, publicId } = await this.uploadBuffer(
      file.buffer,
      folder,
      resourceType,
    );

    // Save record in database
    const fileRecord = await this.prisma.client.fileInstance.create({
      data: {
        filename: uniqueFileName,
        originalFilename: file.originalname,
        path: publicId,
        url: url,
        fileType: this.getFileType(file.mimetype),
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    return fileRecord;
  }

  async removeFile(id: string) {
    const file = await this.prisma.client.fileInstance.findUnique({
      where: { id },
    });

    if (!file) {
      throw new AppError(404, 'File not found');
    }

    // Delete from Cloudinary
    await this.deleteFile(file.path);

    // Delete from database
    await this.prisma.client.fileInstance.delete({
      where: { id },
    });

    return { message: 'File deleted successfully' };
  }
}
