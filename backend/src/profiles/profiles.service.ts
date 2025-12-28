import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { CreateSkillDto } from './dto/create-skill.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, createProfileDto: CreateProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ForbiddenException('Profile already exists');
    }

    return this.prisma.profile.create({
      data: {
        userId,
        ...createProfileDto,
      },
      include: {
        education: true,
        workExperience: true,
        skills: true,
      },
    });
  }

  async getProfile(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        education: true,
        workExperience: true,
        skills: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        education: true,
        workExperience: true,
        skills: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
      include: {
        education: true,
        workExperience: true,
        skills: true,
      },
    });
  }

  async addEducation(userId: string, createEducationDto: CreateEducationDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.education.create({
      data: {
        profileId: profile.id,
        ...createEducationDto,
        startDate: createEducationDto.startDate ? new Date(createEducationDto.startDate) : null,
        endDate: createEducationDto.endDate ? new Date(createEducationDto.endDate) : null,
      },
    });
  }

  async removeEducation(userId: string, educationId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const education = await this.prisma.education.findUnique({
      where: { id: educationId },
    });

    if (!education || education.profileId !== profile.id) {
      throw new NotFoundException('Education not found');
    }

    return this.prisma.education.delete({
      where: { id: educationId },
    });
  }

  async addWorkExperience(userId: string, createWorkExperienceDto: CreateWorkExperienceDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.workExperience.create({
      data: {
        profileId: profile.id,
        ...createWorkExperienceDto,
        startDate: createWorkExperienceDto.startDate ? new Date(createWorkExperienceDto.startDate) : null,
        endDate: createWorkExperienceDto.endDate ? new Date(createWorkExperienceDto.endDate) : null,
      },
    });
  }

  async removeWorkExperience(userId: string, workExperienceId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const workExperience = await this.prisma.workExperience.findUnique({
      where: { id: workExperienceId },
    });

    if (!workExperience || workExperience.profileId !== profile.id) {
      throw new NotFoundException('Work experience not found');
    }

    return this.prisma.workExperience.delete({
      where: { id: workExperienceId },
    });
  }

  async addSkill(userId: string, createSkillDto: CreateSkillDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.skill.create({
      data: {
        profileId: profile.id,
        ...createSkillDto,
      },
    });
  }

  async removeSkill(userId: string, skillId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill || skill.profileId !== profile.id) {
      throw new NotFoundException('Skill not found');
    }

    return this.prisma.skill.delete({
      where: { id: skillId },
    });
  }

  async getAllProfiles() {
    return this.prisma.profile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

