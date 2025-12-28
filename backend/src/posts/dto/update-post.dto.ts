import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  content?: string;
}

