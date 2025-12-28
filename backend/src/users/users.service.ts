import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}


