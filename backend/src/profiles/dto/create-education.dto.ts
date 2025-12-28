import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  institution: string;

  @IsString()
  @IsOptional()
  degree?: string;

  @IsString()
  @IsOptional()
  field?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

