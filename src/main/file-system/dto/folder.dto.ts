import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({ example: 'My Documents' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Personal documents folder' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#FF5733' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent-folder' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateFolderDto {
  @ApiPropertyOptional({ example: 'Updated Folder Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#00FF00' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent-folder' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
