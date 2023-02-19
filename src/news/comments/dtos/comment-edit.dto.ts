import { IsNotEmpty, IsString } from 'class-validator';
export class CommentEditDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}
