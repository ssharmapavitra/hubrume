import { IsString, IsOptional } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  level?: string;
}

