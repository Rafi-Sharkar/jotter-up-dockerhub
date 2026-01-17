import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';
import { FileService } from './services/file.service';
import { MulterService } from './services/multer.service';

@Global()
@Module({
  providers: [FileService, MulterService, CloudinaryService],
  exports: [FileService, MulterService, CloudinaryService],
})
export class FileModule {}
