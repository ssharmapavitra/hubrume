import { IsString, IsOptional } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  contactInfo?: string;
}

