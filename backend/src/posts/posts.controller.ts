import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(req.user.userId, createPostDto);
  }

  @Get('feed')
  getFeed(@Request() req) {
    return this.postsService.getFeed(req.user.userId);
  }

  @Get('user/:userId')
  getUserPosts(@Param('userId') userId: string) {
    return this.postsService.getUserPosts(userId);
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.getPost(id);
  }

  @Put(':id')
  updatePost(@Request() req, @Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.updatePost(id, req.user.userId, updatePostDto);
  }

  @Delete(':id')
  deletePost(@Request() req, @Param('id') id: string) {
    return this.postsService.deletePost(id, req.user.userId);
  }
}

