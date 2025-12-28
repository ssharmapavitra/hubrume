import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    post: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getAllUsersIncludingInactive', () => {
    it('should return all users including inactive', async () => {
      const users = [
        { id: 'user-1', email: 'user1@example.com', isActive: true },
        { id: 'user-2', email: 'user2@example.com', isActive: false },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.getAllUsersIncludingInactive();

      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('disableUser', () => {
    it('should disable user successfully', async () => {
      const userId = 'user-id';
      const user = { id: userId, email: 'user@example.com', isActive: true };
      const disabledUser = { ...user, isActive: false };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue(disabledUser);

      const result = await service.disableUser(userId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { isActive: false },
        select: expect.any(Object),
      });
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user-id';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.disableUser(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('enableUser', () => {
    it('should enable user successfully', async () => {
      const userId = 'user-id';
      const user = { id: userId, email: 'user@example.com', isActive: false };
      const enabledUser = { ...user, isActive: true };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue(enabledUser);

      const result = await service.enableUser(userId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { isActive: true },
        select: expect.any(Object),
      });
      expect(result.isActive).toBe(true);
    });
  });

  describe('getAllPostsIncludingDeleted', () => {
    it('should return all posts including deleted', async () => {
      const posts = [
        { id: 'post-1', content: 'Post 1', deletedAt: null },
        { id: 'post-2', content: 'Post 2', deletedAt: new Date() },
      ];

      mockPrismaService.post.findMany.mockResolvedValue(posts);

      const result = await service.getAllPostsIncludingDeleted();

      expect(mockPrismaService.post.findMany).toHaveBeenCalled();
      expect(result).toEqual(posts);
    });
  });

  describe('deletePost', () => {
    it('should soft delete post successfully', async () => {
      const postId = 'post-id';
      const post = { id: postId, content: 'Test post', deletedAt: null };
      const deletedPost = { ...post, deletedAt: new Date() };

      mockPrismaService.post.findUnique.mockResolvedValue(post);
      mockPrismaService.post.update.mockResolvedValue(deletedPost);

      const result = await service.deletePost(postId);

      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: {
          deletedAt: expect.any(Date),
        },
      });
      expect(result.deletedAt).toBeDefined();
    });

    it('should throw NotFoundException if post not found', async () => {
      const postId = 'post-id';

      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.deletePost(postId)).rejects.toThrow(NotFoundException);
    });
  });
});

