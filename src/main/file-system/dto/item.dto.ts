import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemType } from '@prisma';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'My Note' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'This is a note description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ItemType, example: ItemType.NOTE })
  @IsEnum(ItemType)
  type: ItemType;

  @ApiPropertyOptional({ example: 'Note content here' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'uuid-of-folder' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateItemDto {
  @ApiPropertyOptional({ example: 'Updated Item Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Updated content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'uuid-of-folder' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UploadFileItemDto {
  @ApiProperty({ example: 'My Image' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Image description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ItemType, example: ItemType.IMAGE })
  @IsEnum(ItemType)
  type: ItemType;

  @ApiPropertyOptional({ example: 'uuid-of-folder' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  @IsOptional()
  file?: Express.Multer.File;
}
