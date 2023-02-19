import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
export class NewsCreateDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsNotEmpty()
  @IsString()
  description: string;
  @ValidateIf((o) => o.author)
  @IsString()
  author: string;
  @ValidateIf((o) => o.cover)
  @IsString()
  cover: string;
}
