import { Controller, Get, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsersIncludingInactive();
  }

  @Put('users/:id/disable')
  disableUser(@Param('id') id: string) {
    return this.adminService.disableUser(id);
  }

  @Put('users/:id/enable')
  enableUser(@Param('id') id: string) {
    return this.adminService.enableUser(id);
  }

  @Get('posts')
  getAllPosts() {
    return this.adminService.getAllPostsIncludingDeleted();
  }

  @Delete('posts/:id')
  deletePost(@Param('id') id: string) {
    return this.adminService.deletePost(id);
  }
}

