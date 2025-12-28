import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  follow(@Request() req, @Param('userId') userId: string) {
    return this.followsService.follow(req.user.userId, userId);
  }

  @Delete(':userId')
  unfollow(@Request() req, @Param('userId') userId: string) {
    return this.followsService.unfollow(req.user.userId, userId);
  }

  @Get('followers')
  getFollowers(@Request() req) {
    return this.followsService.getFollowers(req.user.userId);
  }

  @Get('following')
  getFollowing(@Request() req) {
    return this.followsService.getFollowing(req.user.userId);
  }

  @Get(':userId/followers')
  getUserFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @Get(':userId/following')
  getUserFollowing(@Param('userId') userId: string) {
    return this.followsService.getFollowing(userId);
  }

  @Get(':userId/status')
  async getFollowStatus(@Request() req, @Param('userId') userId: string) {
    const isFollowing = await this.followsService.isFollowing(req.user.userId, userId);
    return { isFollowing };
  }
}

