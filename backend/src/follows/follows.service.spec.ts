import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FollowsService', () => {
  let service: FollowsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    follow: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('follow', () => {
    it('should follow a user successfully', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';
      const following = { id: followingId, isActive: true, deletedAt: null };
      const follow = { id: 'follow-id', followerId, followingId };

      mockPrismaService.user.findUnique.mockResolvedValue(following);
      mockPrismaService.follow.findUnique.mockResolvedValue(null);
      mockPrismaService.follow.create.mockResolvedValue(follow);

      const result = await service.follow(followerId, followingId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: followingId },
      });
      expect(mockPrismaService.follow.create).toHaveBeenCalled();
      expect(result).toEqual(follow);
    });

    it('should throw BadRequestException if trying to follow yourself', async () => {
      const userId = 'user-id';

      await expect(service.follow(userId, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.follow(followerId, followingId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already following', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';
      const following = { id: followingId, isActive: true, deletedAt: null };
      const existingFollow = { id: 'follow-id', followerId, followingId };

      mockPrismaService.user.findUnique.mockResolvedValue(following);
      mockPrismaService.follow.findUnique.mockResolvedValue(existingFollow);

      await expect(service.follow(followerId, followingId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('unfollow', () => {
    it('should unfollow a user successfully', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';
      const follow = { id: 'follow-id', followerId, followingId };

      mockPrismaService.follow.findUnique.mockResolvedValue(follow);
      mockPrismaService.follow.delete.mockResolvedValue(follow);

      const result = await service.unfollow(followerId, followingId);

      expect(mockPrismaService.follow.delete).toHaveBeenCalled();
      expect(result).toEqual(follow);
    });

    it('should throw NotFoundException if follow relationship not found', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';

      mockPrismaService.follow.findUnique.mockResolvedValue(null);

      await expect(service.unfollow(followerId, followingId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFollowers', () => {
    it('should return followers list', async () => {
      const userId = 'user-id';
      const user = { id: userId, deletedAt: null };
      const followers = [{ id: 'follow-id', follower: { id: 'follower-id' } }];

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.follow.findMany.mockResolvedValue(followers);

      const result = await service.getFollowers(userId);

      expect(mockPrismaService.follow.findMany).toHaveBeenCalledWith({
        where: { followingId: userId },
        include: expect.any(Object),
      });
      expect(result).toEqual(followers);
    });
  });

  describe('getFollowing', () => {
    it('should return following list', async () => {
      const userId = 'user-id';
      const user = { id: userId, deletedAt: null };
      const following = [{ id: 'follow-id', following: { id: 'following-id' } }];

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.follow.findMany.mockResolvedValue(following);

      const result = await service.getFollowing(userId);

      expect(mockPrismaService.follow.findMany).toHaveBeenCalledWith({
        where: { followerId: userId },
        include: expect.any(Object),
      });
      expect(result).toEqual(following);
    });
  });

  describe('isFollowing', () => {
    it('should return true if following', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';
      const follow = { id: 'follow-id', followerId, followingId };

      mockPrismaService.follow.findUnique.mockResolvedValue(follow);

      const result = await service.isFollowing(followerId, followingId);

      expect(result).toBe(true);
    });

    it('should return false if not following', async () => {
      const followerId = 'follower-id';
      const followingId = 'following-id';

      mockPrismaService.follow.findUnique.mockResolvedValue(null);

      const result = await service.isFollowing(followerId, followingId);

      expect(result).toBe(false);
    });
  });
});

