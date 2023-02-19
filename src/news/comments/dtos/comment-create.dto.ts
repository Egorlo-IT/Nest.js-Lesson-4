import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
export class CommentCreateDto {
  @IsString()
  @IsNotEmpty()
  text: string;
  @ValidateIf((o) => o.avatar)
  @IsString()
  avatar: string;
}
