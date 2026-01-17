import { GetUser, ValidateAuth } from '@/core/jwt/jwt.decorator';
import { MulterService } from '@/lib/file/services/multer.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileType, ItemType } from '@prisma';
import { CreateFolderDto, UpdateFolderDto } from './dto/folder.dto';
import {
  CreateItemDto,
  UpdateItemDto,
  UploadFileItemDto,
} from './dto/item.dto';
import { QueryDto } from './dto/query.dto';
import { FileSystemService } from './file-system.service';

@ApiTags('File System')
@ApiBearerAuth()
@Controller('file-system')
@ValidateAuth()
export class FileSystemController {
  constructor(private readonly fileSystemService: FileSystemService) {}

  // ==================== STORAGE STATS ====================
  @ApiOperation({ summary: 'Get storage statistics' })
  @Get('stats')
  getStorageStats(@GetUser('sub') userId: string) {
    return this.fileSystemService.getStorageStats(userId);
  }

  // ==================== FOLDERS ====================
  @ApiOperation({ summary: 'Create a new folder' })
  @Post('folders')
  createFolder(@GetUser('sub') userId: string, @Body() dto: CreateFolderDto) {
    return this.fileSystemService.createFolder(userId, dto);
  }

  @ApiOperation({ summary: 'Get all folders' })
  @ApiQuery({ name: 'parentId', required: false })
  @Get('folders')
  getFolders(
    @GetUser('sub') userId: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.fileSystemService.getFolders(userId, parentId);
  }

  @ApiOperation({ summary: 'Get a specific folder by ID' })
  @Get('folders/:id')
  getFolder(@GetUser('sub') userId: string, @Param('id') folderId: string) {
    return this.fileSystemService.getFolder(userId, folderId);
  }

  @ApiOperation({ summary: 'Update a folder' })
  @Patch('folders/:id')
  updateFolder(
    @GetUser('sub') userId: string,
    @Param('id') folderId: string,
    @Body() dto: UpdateFolderDto,
  ) {
    return this.fileSystemService.updateFolder(userId, folderId, dto);
  }

  @ApiOperation({ summary: 'Delete a folder' })
  @ApiQuery({ name: 'permanent', required: false, type: Boolean })
  @Delete('folders/:id')
  deleteFolder(
    @GetUser('sub') userId: string,
    @Param('id') folderId: string,
    @Query('permanent') permanent?: string,
  ) {
    return this.fileSystemService.deleteFolder(
      userId,
      folderId,
      permanent === 'true',
    );
  }

  @ApiOperation({ summary: 'Toggle folder favorite status' })
  @Post('folders/:id/favorite')
  toggleFolderFavorite(
    @GetUser('sub') userId: string,
    @Param('id') folderId: string,
  ) {
    return this.fileSystemService.toggleFolderFavorite(userId, folderId);
  }

  // ==================== ITEMS ====================
  @ApiOperation({ summary: 'Create a new item (note, link, etc.)' })
  @Post('items')
  createItem(@GetUser('sub') userId: string, @Body() dto: CreateItemDto) {
    return this.fileSystemService.createItem(userId, dto);
  }

  @ApiOperation({ summary: 'Upload a file item (image, PDF, document, etc.)' })
  @ApiConsumes('multipart/form-data')
  @Post('items/upload')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new MulterService().createMemoryStorageOptions(FileType.any, 50 * 1024 * 1024),
    ),
  )
  uploadFileItem(
    @GetUser('sub') userId: string,
    @Body() dto: UploadFileItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.fileSystemService.uploadFileItem(userId, dto, file);
  }

  @ApiOperation({ summary: 'Get all items with filtering' })
  @ApiQuery({ name: 'folderId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ItemType })
  @ApiQuery({ name: 'favorites', required: false, type: Boolean })
  @Get('items')
  getItems(
    @GetUser('sub') userId: string,
    @Query() query: QueryDto,
    @Query('folderId') folderId?: string,
    @Query('type') type?: ItemType,
    @Query('favorites') favorites?: string,
  ) {
    return this.fileSystemService.getItems(
      userId,
      query,
      folderId,
      type,
      favorites === 'true',
    );
  }

  @ApiOperation({ summary: 'Get recent items' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('items/recent')
  getRecentItems(
    @GetUser('sub') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.fileSystemService.getRecentItems(
      userId,
      limit ? parseInt(limit) : undefined,
    );
  }

  @ApiOperation({ summary: 'Get a specific item by ID' })
  @Get('items/:id')
  getItem(@GetUser('sub') userId: string, @Param('id') itemId: string) {
    return this.fileSystemService.getItem(userId, itemId);
  }

  @ApiOperation({ summary: 'Update an item' })
  @Patch('items/:id')
  updateItem(
    @GetUser('sub') userId: string,
    @Param('id') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.fileSystemService.updateItem(userId, itemId, dto);
  }

  @ApiOperation({ summary: 'Delete an item' })
  @ApiQuery({ name: 'permanent', required: false, type: Boolean })
  @Delete('items/:id')
  deleteItem(
    @GetUser('sub') userId: string,
    @Param('id') itemId: string,
    @Query('permanent') permanent?: string,
  ) {
    return this.fileSystemService.deleteItem(
      userId,
      itemId,
      permanent === 'true',
    );
  }

  @ApiOperation({ summary: 'Toggle item favorite status' })
  @Post('items/:id/favorite')
  toggleItemFavorite(
    @GetUser('sub') userId: string,
    @Param('id') itemId: string,
  ) {
    return this.fileSystemService.toggleItemFavorite(userId, itemId);
  }

  @ApiOperation({ summary: 'Duplicate an item' })
  @Post('items/:id/duplicate')
  duplicateItem(@GetUser('sub') userId: string, @Param('id') itemId: string) {
    return this.fileSystemService.duplicateItem(userId, itemId);
  }

  // ==================== SEARCH ====================
  @ApiOperation({ summary: 'Search folders and items' })
  @ApiQuery({ name: 'q', required: true })
  @Get('search')
  search(
    @GetUser('sub') userId: string,
    @Query('q') searchTerm: string,
    @Query() query: QueryDto,
  ) {
    return this.fileSystemService.search(userId, searchTerm, query);
  }

  // ==================== FAVORITES ====================
  @ApiOperation({ summary: 'Get all favorite folders and items' })
  @Get('favorites')
  getFavorites(@GetUser('sub') userId: string) {
    return this.fileSystemService.getFavorites(userId);
  }

  // ==================== TRASH ====================
  @ApiOperation({ summary: 'Get all deleted folders and items' })
  @Get('trash')
  getTrash(@GetUser('sub') userId: string) {
    return this.fileSystemService.getTrash(userId);
  }

  @ApiOperation({ summary: 'Restore an item from trash' })
  @ApiQuery({ name: 'type', required: true, enum: ['folder', 'item'] })
  @Post('trash/:id/restore')
  restoreFromTrash(
    @GetUser('sub') userId: string,
    @Param('id') itemId: string,
    @Query('type') type: 'folder' | 'item',
  ) {
    return this.fileSystemService.restoreFromTrash(userId, itemId, type);
  }

  @ApiOperation({ summary: 'Empty trash (permanently delete all)' })
  @Delete('trash')
  emptyTrash(@GetUser('sub') userId: string) {
    return this.fileSystemService.emptyTrash(userId);
  }
}
