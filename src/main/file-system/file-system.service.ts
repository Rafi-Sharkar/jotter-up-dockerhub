import { successResponse } from '@/common/utils/response.util';
import { AppError } from '@/core/error/handle-error.app';
import { HandleError } from '@/core/error/handle-error.decorator';
import { CloudinaryService } from '@/lib/file/services/cloudinary.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ItemType } from '@prisma';
import { CreateFolderDto, UpdateFolderDto } from './dto/folder.dto';
import {
    CreateItemDto,
    UpdateItemDto,
    UploadFileItemDto,
} from './dto/item.dto';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class FileSystemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ==================== STORAGE STATS ====================
  @HandleError('Failed to get storage stats', 'FileSystem')
  async getStorageStats(userId: string) {
    const totalStorage = 15 * 1024 * 1024 * 1024; // 15 GB in bytes

    const usedStorage = await this.prisma.client.item.aggregate({
      where: { userId, isDeleted: false },
      _sum: { size: true },
    });

    const itemStats = await this.prisma.client.item.groupBy({
      by: ['type'],
      where: { userId, isDeleted: false },
      _count: { id: true },
      _sum: { size: true },
    });

    const folderCount = await this.prisma.client.folder.count({
      where: { userId, isDeleted: false },
    });

    const usedBytes = Number(usedStorage._sum.size || 0);
    const availableBytes = totalStorage - usedBytes;

    return successResponse(
      {
        totalStorage: totalStorage,
        usedStorage: usedBytes,
        availableStorage: availableBytes,
        totalStorageGB: (totalStorage / (1024 * 1024 * 1024)).toFixed(2),
        usedStorageGB: (usedBytes / (1024 * 1024 * 1024)).toFixed(2),
        availableStorageGB: (availableBytes / (1024 * 1024 * 1024)).toFixed(2),
        itemStats: itemStats.map((stat) => ({
          type: stat.type,
          count: stat._count.id,
          size: Number(stat._sum.size || 0),
          sizeGB: (Number(stat._sum.size || 0) / (1024 * 1024 * 1024)).toFixed(
            2,
          ),
        })),
        folderCount,
      },
      'Storage stats retrieved successfully',
    );
  }

  // ==================== FOLDERS ====================
  @HandleError('Failed to create folder', 'FileSystem')
  async createFolder(userId: string, dto: CreateFolderDto) {
    if (dto.parentId) {
      const parent = await this.prisma.client.folder.findFirst({
        where: { id: dto.parentId, userId, isDeleted: false },
      });

      if (!parent) {
        throw new AppError(404, 'Parent folder not found');
      }
    }

    const folder = await this.prisma.client.folder.create({
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        parentId: dto.parentId,
        userId,
      },
      include: {
        subfolders: true,
        items: true,
      },
    });

    return successResponse(folder, 'Folder created successfully');
  }

  @HandleError('Failed to get folders', 'FileSystem')
  async getFolders(userId: string, parentId?: string) {
    const folders = await this.prisma.client.folder.findMany({
      where: {
        userId,
        isDeleted: false,
        parentId: parentId || null,
      },
      include: {
        subfolders: {
          where: { isDeleted: false },
        },
        items: {
          where: { isDeleted: false },
          include: { file: true },
        },
        _count: {
          select: {
            items: { where: { isDeleted: false } },
            subfolders: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(folders, 'Folders retrieved successfully');
  }

  @HandleError('Failed to get folder', 'FileSystem')
  async getFolder(userId: string, folderId: string) {
    const folder = await this.prisma.client.folder.findFirst({
      where: { id: folderId, userId, isDeleted: false },
      include: {
        subfolders: {
          where: { isDeleted: false },
        },
        items: {
          where: { isDeleted: false },
          include: { file: true },
        },
        parent: true,
        _count: {
          select: {
            items: { where: { isDeleted: false } },
            subfolders: { where: { isDeleted: false } },
          },
        },
      },
    });

    if (!folder) {
      throw new AppError(404, 'Folder not found');
    }

    return successResponse(folder, 'Folder retrieved successfully');
  }

  @HandleError('Failed to update folder', 'FileSystem')
  async updateFolder(userId: string, folderId: string, dto: UpdateFolderDto) {
    const folder = await this.prisma.client.folder.findFirst({
      where: { id: folderId, userId, isDeleted: false },
    });

    if (!folder) {
      throw new AppError(404, 'Folder not found');
    }

    if (dto.parentId) {
      if (dto.parentId === folderId) {
        throw new AppError(400, 'Folder cannot be its own parent');
      }

      const parent = await this.prisma.client.folder.findFirst({
        where: { id: dto.parentId, userId, isDeleted: false },
      });

      if (!parent) {
        throw new AppError(404, 'Parent folder not found');
      }
    }

    const updated = await this.prisma.client.folder.update({
      where: { id: folderId },
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        parentId: dto.parentId,
      },
      include: {
        subfolders: true,
        items: true,
      },
    });

    return successResponse(updated, 'Folder updated successfully');
  }

  @HandleError('Failed to delete folder', 'FileSystem')
  async deleteFolder(userId: string, folderId: string, permanent = false) {
    const folder = await this.prisma.client.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new AppError(404, 'Folder not found');
    }

    if (permanent) {
      await this.prisma.client.folder.delete({
        where: { id: folderId },
      });
      return successResponse(null, 'Folder permanently deleted');
    } else {
      await this.prisma.client.folder.update({
        where: { id: folderId },
        data: { isDeleted: true },
      });
      return successResponse(null, 'Folder moved to trash');
    }
  }

  @HandleError('Failed to toggle favorite', 'FileSystem')
  async toggleFolderFavorite(userId: string, folderId: string) {
    const folder = await this.prisma.client.folder.findFirst({
      where: { id: folderId, userId, isDeleted: false },
    });

    if (!folder) {
      throw new AppError(404, 'Folder not found');
    }

    const updated = await this.prisma.client.folder.update({
      where: { id: folderId },
      data: { isFavorite: !folder.isFavorite },
    });

    return successResponse(
      updated,
      `Folder ${updated.isFavorite ? 'added to' : 'removed from'} favorites`,
    );
  }

  // ==================== ITEMS ====================
  @HandleError('Failed to create item', 'FileSystem')
  async createItem(userId: string, dto: CreateItemDto) {
    if (dto.folderId) {
      const folder = await this.prisma.client.folder.findFirst({
        where: { id: dto.folderId, userId, isDeleted: false },
      });

      if (!folder) {
        throw new AppError(404, 'Folder not found');
      }
    }

    const item = await this.prisma.client.item.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        content: dto.content,
        folderId: dto.folderId,
        userId,
        tags: dto.tags || [],
      },
      include: {
        file: true,
        folder: true,
      },
    });

    return successResponse(item, 'Item created successfully');
  }

  @HandleError('Failed to upload file item', 'FileSystem')
  async uploadFileItem(
    userId: string,
    dto: UploadFileItemDto,
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new AppError(400, 'File is required');
    }

    if (dto.folderId) {
      const folder = await this.prisma.client.folder.findFirst({
        where: { id: dto.folderId, userId, isDeleted: false },
      });

      if (!folder) {
        throw new AppError(404, 'Folder not found');
      }
    }

    const uploadedFile = await this.cloudinary.uploadFile(file);

    const item = await this.prisma.client.item.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        fileId: uploadedFile.id,
        folderId: dto.folderId,
        userId,
        size: file.size,
      },
      include: {
        file: true,
        folder: true,
      },
    });

    return successResponse(item, 'File uploaded successfully');
  }

  @HandleError('Failed to get items', 'FileSystem')
  async getItems(
    userId: string,
    query: QueryDto,
    folderId?: string,
    type?: ItemType,
    favorites?: boolean,
  ) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {
      userId,
      isDeleted: false,
    };

    if (folderId) {
      where.folderId = folderId;
    }

    if (type) {
      where.type = type;
    }

    if (favorites !== undefined) {
      where.isFavorite = favorites;
    }

    const [items, total] = await Promise.all([
      this.prisma.client.item.findMany({
        where,
        include: {
          file: true,
          folder: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.client.item.count({ where }),
    ]);

    return successResponse(
      {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Items retrieved successfully',
    );
  }

  @HandleError('Failed to get recent items', 'FileSystem')
  async getRecentItems(userId: string, limit = 10) {
    const items = await this.prisma.client.item.findMany({
      where: { userId, isDeleted: false },
      include: {
        file: true,
        folder: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return successResponse(items, 'Recent items retrieved successfully');
  }

  @HandleError('Failed to get item', 'FileSystem')
  async getItem(userId: string, itemId: string) {
    const item = await this.prisma.client.item.findFirst({
      where: { id: itemId, userId, isDeleted: false },
      include: {
        file: true,
        folder: true,
      },
    });

    if (!item) {
      throw new AppError(404, 'Item not found');
    }

    return successResponse(item, 'Item retrieved successfully');
  }

  @HandleError('Failed to update item', 'FileSystem')
  async updateItem(userId: string, itemId: string, dto: UpdateItemDto) {
    const item = await this.prisma.client.item.findFirst({
      where: { id: itemId, userId, isDeleted: false },
    });

    if (!item) {
      throw new AppError(404, 'Item not found');
    }

    if (dto.folderId) {
      const folder = await this.prisma.client.folder.findFirst({
        where: { id: dto.folderId, userId, isDeleted: false },
      });

      if (!folder) {
        throw new AppError(404, 'Folder not found');
      }
    }

    const updated = await this.prisma.client.item.update({
      where: { id: itemId },
      data: {
        name: dto.name,
        description: dto.description,
        content: dto.content,
        folderId: dto.folderId,
        tags: dto.tags,
      },
      include: {
        file: true,
        folder: true,
      },
    });

    return successResponse(updated, 'Item updated successfully');
  }

  @HandleError('Failed to delete item', 'FileSystem')
  async deleteItem(userId: string, itemId: string, permanent = false) {
    const item = await this.prisma.client.item.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new AppError(404, 'Item not found');
    }

    if (permanent) {
      if (item.fileId) {
        await this.cloudinary.removeFile(item.fileId);
      }
      await this.prisma.client.item.delete({
        where: { id: itemId },
      });
      return successResponse(null, 'Item permanently deleted');
    } else {
      await this.prisma.client.item.update({
        where: { id: itemId },
        data: { isDeleted: true },
      });
      return successResponse(null, 'Item moved to trash');
    }
  }

  @HandleError('Failed to toggle favorite', 'FileSystem')
  async toggleItemFavorite(userId: string, itemId: string) {
    const item = await this.prisma.client.item.findFirst({
      where: { id: itemId, userId, isDeleted: false },
    });

    if (!item) {
      throw new AppError(404, 'Item not found');
    }

    const updated = await this.prisma.client.item.update({
      where: { id: itemId },
      data: { isFavorite: !item.isFavorite },
    });

    return successResponse(
      updated,
      `Item ${updated.isFavorite ? 'added to' : 'removed from'} favorites`,
    );
  }

  @HandleError('Failed to duplicate item', 'FileSystem')
  async duplicateItem(userId: string, itemId: string) {
    const item = await this.prisma.client.item.findFirst({
      where: { id: itemId, userId, isDeleted: false },
    });

    if (!item) {
      throw new AppError(404, 'Item not found');
    }

    const duplicate = await this.prisma.client.item.create({
      data: {
        name: `${item.name} (Copy)`,
        description: item.description,
        type: item.type,
        content: item.content,
        fileId: item.fileId,
        folderId: item.folderId,
        userId,
        size: item.size,
        tags: item.tags,
      },
      include: {
        file: true,
        folder: true,
      },
    });

    return successResponse(duplicate, 'Item duplicated successfully');
  }

  // ==================== SEARCH ====================
  @HandleError('Failed to search', 'FileSystem')
  async search(userId: string, searchTerm: string, query: QueryDto) {
    const { page = 1, limit = 10 } = query;

    const [folders, items] = await Promise.all([
      this.prisma.client.folder.findMany({
        where: {
          userId,
          isDeleted: false,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          _count: {
            select: {
              items: { where: { isDeleted: false } },
              subfolders: { where: { isDeleted: false } },
            },
          },
        },
        take: limit,
      }),
      this.prisma.client.item.findMany({
        where: {
          userId,
          isDeleted: false,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { has: searchTerm } },
          ],
        },
        include: {
          file: true,
          folder: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return successResponse(
      { folders, items },
      'Search results retrieved successfully',
    );
  }

  // ==================== FAVORITES ====================
  @HandleError('Failed to get favorites', 'FileSystem')
  async getFavorites(userId: string) {
    const [folders, items] = await Promise.all([
      this.prisma.client.folder.findMany({
        where: { userId, isDeleted: false, isFavorite: true },
        include: {
          _count: {
            select: {
              items: { where: { isDeleted: false } },
              subfolders: { where: { isDeleted: false } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.client.item.findMany({
        where: { userId, isDeleted: false, isFavorite: true },
        include: {
          file: true,
          folder: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return successResponse(
      { folders, items },
      'Favorites retrieved successfully',
    );
  }

  // ==================== TRASH ====================
  @HandleError('Failed to get trash', 'FileSystem')
  async getTrash(userId: string) {
    const [folders, items] = await Promise.all([
      this.prisma.client.folder.findMany({
        where: { userId, isDeleted: true },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.client.item.findMany({
        where: { userId, isDeleted: true },
        include: {
          file: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return successResponse({ folders, items }, 'Trash retrieved successfully');
  }

  @HandleError('Failed to restore', 'FileSystem')
  async restoreFromTrash(userId: string, itemId: string, type: 'folder' | 'item') {
    if (type === 'folder') {
      const folder = await this.prisma.client.folder.findFirst({
        where: { id: itemId, userId, isDeleted: true },
      });

      if (!folder) {
        throw new AppError(404, 'Folder not found in trash');
      }

      await this.prisma.client.folder.update({
        where: { id: itemId },
        data: { isDeleted: false },
      });
    } else {
      const item = await this.prisma.client.item.findFirst({
        where: { id: itemId, userId, isDeleted: true },
      });

      if (!item) {
        throw new AppError(404, 'Item not found in trash');
      }

      await this.prisma.client.item.update({
        where: { id: itemId },
        data: { isDeleted: false },
      });
    }

    return successResponse(null, 'Restored successfully');
  }

  @HandleError('Failed to empty trash', 'FileSystem')
  async emptyTrash(userId: string) {
    const items = await this.prisma.client.item.findMany({
      where: { userId, isDeleted: true },
    });

    for (const item of items) {
      if (item.fileId) {
        await this.cloudinary.removeFile(item.fileId);
      }
    }

    await Promise.all([
      this.prisma.client.folder.deleteMany({
        where: { userId, isDeleted: true },
      }),
      this.prisma.client.item.deleteMany({
        where: { userId, isDeleted: true },
      }),
    ]);

    return successResponse(null, 'Trash emptied successfully');
  }
}
