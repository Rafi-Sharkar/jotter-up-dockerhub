import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FileSystemModule } from './file-system/file-system.module';


@Module({
  imports: [AuthModule, FileSystemModule],
})
export class MainModule {}
