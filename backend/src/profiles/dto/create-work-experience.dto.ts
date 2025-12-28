import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateWorkExperienceDto {
  @IsString()
  company: string;

  @IsString()
  position: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

