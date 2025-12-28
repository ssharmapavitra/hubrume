import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const following = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!following || !following.isActive || following.deletedAt) {
      throw new NotFoundException('User not found or inactive');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new BadRequestException('Already following this user');
    }

    return this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
      include: {
        following: {
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

  async unfollow(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    return this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async getFollowers(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
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
  }

  async getFollowing(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
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
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return !!follow;
  }
}

