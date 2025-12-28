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
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { CreateSkillDto } from './dto/create-skill.dto';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  createProfile(@Request() req, @Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.createProfile(req.user.userId, createProfileDto);
  }

  @Get()
  getAllProfiles() {
    return this.profilesService.getAllProfiles();
  }

  @Get('me')
  getMyProfile(@Request() req) {
    return this.profilesService.getProfileByUserId(req.user.userId);
  }

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.profilesService.getProfile(id);
  }

  @Put('me')
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Post('me/education')
  addEducation(@Request() req, @Body() createEducationDto: CreateEducationDto) {
    return this.profilesService.addEducation(req.user.userId, createEducationDto);
  }

  @Delete('me/education/:id')
  removeEducation(@Request() req, @Param('id') id: string) {
    return this.profilesService.removeEducation(req.user.userId, id);
  }

  @Post('me/work-experience')
  addWorkExperience(@Request() req, @Body() createWorkExperienceDto: CreateWorkExperienceDto) {
    return this.profilesService.addWorkExperience(req.user.userId, createWorkExperienceDto);
  }

  @Delete('me/work-experience/:id')
  removeWorkExperience(@Request() req, @Param('id') id: string) {
    return this.profilesService.removeWorkExperience(req.user.userId, id);
  }

  @Post('me/skills')
  addSkill(@Request() req, @Body() createSkillDto: CreateSkillDto) {
    return this.profilesService.addSkill(req.user.userId, createSkillDto);
  }

  @Delete('me/skills/:id')
  removeSkill(@Request() req, @Param('id') id: string) {
    return this.profilesService.removeSkill(req.user.userId, id);
  }
}

