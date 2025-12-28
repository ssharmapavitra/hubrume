import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = 'hashedPassword';
      const createdUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'USER',
        createdAt: new Date(),
      };
      const token = 'jwt-token';

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.register(registerDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: createdUser.id,
        email: createdUser.email,
      });
      expect(result).toEqual({ user: createdUser, token });
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = { email: 'test@example.com', password: 'password123' };
      const existingUser = { id: 'user-id', email: 'test@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
        isActive: true,
        deletedAt: null,
      };
      const token = 'jwt-token';

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(result).toEqual({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
        isActive: true,
        deletedAt: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
        isActive: false,
        deletedAt: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is deleted', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
        isActive: true,
        deletedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });
});

