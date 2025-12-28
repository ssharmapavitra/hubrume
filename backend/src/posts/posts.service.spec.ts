import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { FollowsService } from '../follows/follows.service';

describe('PostsService', () => {
  let service: PostsService;
  let prismaService: PrismaService;
  let followsService: FollowsService;

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockFollowsService = {
    getFollowing: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FollowsService,
          useValue: mockFollowsService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prismaService = module.get<PrismaService>(PrismaService);
    followsService = module.get<FollowsService>(FollowsService);

    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const authorId = 'user-id';
      const createPostDto = { content: 'Test post content' };
      const post = { id: 'post-id', authorId, ...createPostDto };

      mockPrismaService.post.create.mockResolvedValue(post);

      const result = await service.createPost(authorId, createPostDto);

      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: {
          authorId,
          content: createPostDto.content,
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(post);
    });
  });

  describe('getPost', () => {
    it('should return post by id', async () => {
      const postId = 'post-id';
      const post = { id: postId, content: 'Test', deletedAt: null };

      mockPrismaService.post.findFirst.mockResolvedValue(post);

      const result = await service.getPost(postId);

      expect(mockPrismaService.post.findFirst).toHaveBeenCalledWith({
        where: {
          id: postId,
          deletedAt: null,
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(post);
    });

    it('should throw NotFoundException if post not found', async () => {
      const postId = 'post-id';

      mockPrismaService.post.findFirst.mockResolvedValue(null);

      await expect(service.getPost(postId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserPosts', () => {
    it('should return user posts', async () => {
      const userId = 'user-id';
      const user = { id: userId, deletedAt: null };
      const posts = [{ id: 'post-id', authorId: userId }];

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.post.findMany.mockResolvedValue(posts);

      const result = await service.getUserPosts(userId);

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
        where: {
          authorId: userId,
          deletedAt: null,
        },
        include: expect.any(Object),
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(posts);
    });
  });

  describe('getFeed', () => {
    it('should return feed from followed users', async () => {
      const userId = 'user-id';
      const following = [
        { followingId: 'following-1' },
        { followingId: 'following-2' },
      ];
      const posts = [{ id: 'post-id', authorId: 'following-1' }];

      mockFollowsService.getFollowing.mockResolvedValue(following);
      mockPrismaService.post.findMany.mockResolvedValue(posts);

      const result = await service.getFeed(userId);

      expect(mockFollowsService.getFollowing).toHaveBeenCalledWith(userId);
      expect(mockPrismaService.post.findMany).toHaveBeenCalled();
      expect(result).toEqual(posts);
    });
  });

  describe('updatePost', () => {
    it('should update post successfully', async () => {
      const postId = 'post-id';
      const userId = 'user-id';
      const updatePostDto = { content: 'Updated content' };
      const post = { id: postId, authorId: userId, deletedAt: null };
      const updatedPost = { ...post, ...updatePostDto };

      mockPrismaService.post.findFirst.mockResolvedValue(post);
      mockPrismaService.post.update.mockResolvedValue(updatedPost);

      const result = await service.updatePost(postId, userId, updatePostDto);

      expect(mockPrismaService.post.update).toHaveBeenCalled();
      expect(result).toEqual(updatedPost);
    });

    it('should throw ForbiddenException if not the author', async () => {
      const postId = 'post-id';
      const userId = 'user-id';
      const updatePostDto = { content: 'Updated content' };
      const post = { id: postId, authorId: 'other-user-id', deletedAt: null };

      mockPrismaService.post.findFirst.mockResolvedValue(post);

      await expect(service.updatePost(postId, userId, updatePostDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deletePost', () => {
    it('should soft delete post successfully', async () => {
      const postId = 'post-id';
      const userId = 'user-id';
      const post = { id: postId, authorId: userId, deletedAt: null };

      mockPrismaService.post.findFirst.mockResolvedValue(post);
      mockPrismaService.post.update.mockResolvedValue({ ...post, deletedAt: new Date() });

      const result = await service.deletePost(postId, userId);

      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: {
          deletedAt: expect.any(Date),
        },
      });
      expect(result.deletedAt).toBeDefined();
    });
  });
});

