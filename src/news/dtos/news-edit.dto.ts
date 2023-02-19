import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
export class NewsEditDto {
  @IsNotEmpty()
  @IsString()
  id: string;
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsNotEmpty()
  @IsString()
  description: string;
  @ValidateIf((o) => o.author)
  @IsString()
  author: string;
}
