import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FollowsService } from '../follows/follows.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private followsService: FollowsService,
  ) {}

  async createPost(authorId: string, createPostDto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        authorId,
        content: createPostDto.content,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async getPost(postId: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                id: true,
                name: true,
                bio: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async getUserPosts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.post.findMany({
      where: {
        authorId: userId,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFeed(userId: string) {
    const following = await this.followsService.getFollowing(userId);
    const followingIds = following.map((f) => f.followingId);

    return this.prisma.post.findMany({
      where: {
        authorId: {
          in: followingIds,
        },
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                id: true,
                name: true,
                bio: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updatePost(postId: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Not authorized to update this post');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: updatePostDto,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Not authorized to delete this post');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

