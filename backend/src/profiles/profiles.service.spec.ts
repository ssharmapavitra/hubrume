import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    profile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    education: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    workExperience: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    skill: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    it('should create a profile successfully', async () => {
      const userId = 'user-id';
      const createProfileDto = { name: 'John Doe', bio: 'Developer', contactInfo: 'john@example.com' };
      const createdProfile = { id: 'profile-id', userId, ...createProfileDto };

      mockPrismaService.profile.findUnique.mockResolvedValue(null);
      mockPrismaService.profile.create.mockResolvedValue(createdProfile);

      const result = await service.createProfile(userId, createProfileDto);

      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockPrismaService.profile.create).toHaveBeenCalledWith({
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
      expect(result).toEqual(createdProfile);
    });

    it('should throw ForbiddenException if profile already exists', async () => {
      const userId = 'user-id';
      const createProfileDto = { name: 'John Doe' };
      const existingProfile = { id: 'profile-id', userId };

      mockPrismaService.profile.findUnique.mockResolvedValue(existingProfile);

      await expect(service.createProfile(userId, createProfileDto)).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.profile.create).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return profile by id', async () => {
      const profileId = 'profile-id';
      const profile = { id: profileId, name: 'John Doe' };

      mockPrismaService.profile.findUnique.mockResolvedValue(profile);

      const result = await service.getProfile(profileId);

      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
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
      expect(result).toEqual(profile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      const profileId = 'profile-id';

      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(profileId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const userId = 'user-id';
      const updateProfileDto = { name: 'Jane Doe' };
      const existingProfile = { id: 'profile-id', userId, name: 'John Doe' };
      const updatedProfile = { ...existingProfile, ...updateProfileDto };

      mockPrismaService.profile.findUnique.mockResolvedValue(existingProfile);
      mockPrismaService.profile.update.mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(mockPrismaService.profile.update).toHaveBeenCalledWith({
        where: { userId },
        data: updateProfileDto,
        include: {
          education: true,
          workExperience: true,
          skills: true,
        },
      });
      expect(result).toEqual(updatedProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      const userId = 'user-id';
      const updateProfileDto = { name: 'Jane Doe' };

      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addEducation', () => {
    it('should add education successfully', async () => {
      const userId = 'user-id';
      const createEducationDto = { institution: 'University', degree: 'BS', field: 'CS' };
      const profile = { id: 'profile-id', userId };
      const education = { id: 'edu-id', profileId: profile.id, ...createEducationDto };

      mockPrismaService.profile.findUnique.mockResolvedValue(profile);
      mockPrismaService.education.create.mockResolvedValue(education);

      const result = await service.addEducation(userId, createEducationDto);

      expect(mockPrismaService.education.create).toHaveBeenCalled();
      expect(result).toEqual(education);
    });

    it('should throw NotFoundException if profile not found', async () => {
      const userId = 'user-id';
      const createEducationDto = { institution: 'University' };

      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.addEducation(userId, createEducationDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeEducation', () => {
    it('should remove education successfully', async () => {
      const userId = 'user-id';
      const educationId = 'edu-id';
      const profile = { id: 'profile-id', userId };
      const education = { id: educationId, profileId: profile.id };

      mockPrismaService.profile.findUnique.mockResolvedValue(profile);
      mockPrismaService.education.findUnique.mockResolvedValue(education);
      mockPrismaService.education.delete.mockResolvedValue(education);

      const result = await service.removeEducation(userId, educationId);

      expect(mockPrismaService.education.delete).toHaveBeenCalledWith({
        where: { id: educationId },
      });
      expect(result).toEqual(education);
    });

    it('should throw NotFoundException if education not found', async () => {
      const userId = 'user-id';
      const educationId = 'edu-id';
      const profile = { id: 'profile-id', userId };

      mockPrismaService.profile.findUnique.mockResolvedValue(profile);
      mockPrismaService.education.findUnique.mockResolvedValue(null);

      await expect(service.removeEducation(userId, educationId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addWorkExperience', () => {
    it('should add work experience successfully', async () => {
      const userId = 'user-id';
      const createWorkExperienceDto = { company: 'Tech Corp', position: 'Developer' };
      const profile = { id: 'profile-id', userId };
      const workExperience = { id: 'work-id', profileId: profile.id, ...createWorkExperienceDto };

      mockPrismaService.profile.findUnique.mockResolvedValue(profile);
      mockPrismaService.workExperience.create.mockResolvedValue(workExperience);

      const result = await service.addWorkExperience(userId, createWorkExperienceDto);

      expect(mockPrismaService.workExperience.create).toHaveBeenCalled();
      expect(result).toEqual(workExperience);
    });
  });

  describe('addSkill', () => {
    it('should add skill successfully', async () => {
      const userId = 'user-id';
      const createSkillDto = { name: 'JavaScript', level: 'Expert' };
      const profile = { id: 'profile-id', userId };
      const skill = { id: 'skill-id', profileId: profile.id, ...createSkillDto };

      mockPrismaService.profile.findUnique.mockResolvedValue(profile);
      mockPrismaService.skill.create.mockResolvedValue(skill);

      const result = await service.addSkill(userId, createSkillDto);

      expect(mockPrismaService.skill.create).toHaveBeenCalled();
      expect(result).toEqual(skill);
    });
  });
});

