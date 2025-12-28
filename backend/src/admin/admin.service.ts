import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllUsersIncludingInactive() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async disableUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

  async enableUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

  async getAllPosts() {
    return this.prisma.post.findMany({
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

  async getAllPostsIncludingDeleted() {
    return this.prisma.post.findMany({
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

  async deletePost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

