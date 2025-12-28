import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import * as puppeteer from 'puppeteer';

jest.mock('puppeteer');

describe('PdfService', () => {
  let service: PdfService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    profile: {
      findUnique: jest.fn(),
    },
  };

  const mockBrowser = {
    newPage: jest.fn(),
    close: jest.fn(),
  };

  const mockPage = {
    setContent: jest.fn(),
    pdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);
    mockBrowser.newPage.mockResolvedValue(mockPage);
    mockPage.pdf.mockResolvedValue(Buffer.from('pdf content'));
  });

  describe('generateProfilePdf', () => {
    it('should generate PDF successfully', async () => {
      const profileId = 'profile-id';
      const profile = {
        id: profileId,
        name: 'John Doe',
        bio: 'Developer',
        contactInfo: 'john@example.com',
        education: [],
        workExperience: [],
        skills: [],
        user: { email: 'john@example.com' },
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(profile);

      const result = await service.generateProfilePdf(profileId);

      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { id: profileId },
        include: expect.any(Object),
      });
      expect(puppeteer.launch).toHaveBeenCalled();
      expect(mockPage.setContent).toHaveBeenCalled();
      expect(mockPage.pdf).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should throw NotFoundException if profile not found', async () => {
      const profileId = 'profile-id';

      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.generateProfilePdf(profileId)).rejects.toThrow(NotFoundException);
    });
  });
});

