import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { News } from '../news.interface';
import { CommentIdDto } from './dtos/comment-id.dto';
import { CommentCreateDto } from './dtos/comment-create.dto';
import { CommentEditDto } from './dtos/comment-edit.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HelperFileLoader } from '../../utils/helperFileLoader';
import { imageFileFilter } from 'src/utils/imageFileFilter';

const PATH_COMMENTS = '/comments-static/';
const helperFileLoader = new HelperFileLoader();
helperFileLoader.path = PATH_COMMENTS;

@Controller('news-comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('all')
  getAll(@Query('idNews') idNews: string): Promise<News | News[]> {
    return this.commentsService.findAll(idNews);
  }
  @Post('create')
  @UseInterceptors(
    FilesInterceptor('avatar', 1, {
      storage: diskStorage({
        destination: helperFileLoader.destinationPath,
        filename: helperFileLoader.customFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async create(
    @Query('idNews') idNews: string,
    @Body() comment: CommentCreateDto,
    @UploadedFiles() avatar: Express.Multer.File,
  ): Promise<number> {
    let avatarPath: string;
    if (avatar[0]?.filename?.length > 0) {
      avatarPath = PATH_COMMENTS + avatar[0].filename;
    }
    try {
      return this.commentsService.create(
        idNews,
        null,
        comment.text,
        avatarPath,
      );
    } catch (error) {
      console.log(error);
    }
  }
  @Post(':id/reply')
  @UseInterceptors(
    FilesInterceptor('avatar', 1, {
      storage: diskStorage({
        destination: helperFileLoader.destinationPath,
        filename: helperFileLoader.customFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async reply(
    @Param() params: CommentIdDto,
    @Body() comment: CommentCreateDto,
    @UploadedFiles() avatarReply: Express.Multer.File,
  ): Promise<number> {
    let avatarPathReply;
    if (avatarReply[0]?.filename?.length > 0) {
      avatarPathReply = PATH_COMMENTS + avatarReply[0].filename;
    }
    try {
      return this.commentsService.create(
        null,
        params.id,
        comment.text,
        avatarPathReply,
      );
    } catch (error) {
      console.log(error);
    }
  }
  @Post('edit')
  async edit(
    @Query('idComment') idComment: string,
    @Body() comment: CommentEditDto,
  ): Promise<boolean> {
    return this.commentsService.edit(idComment, comment.text);
  }
  @Delete('all')
  removeAll(@Query('idNews') idNews: string): Promise<boolean> {
    return this.commentsService.removeAll(idNews);
  }
  @Delete(':id')
  remove(
    @Query('idNews') idNews: string,
    @Param() params: CommentIdDto,
  ): Promise<boolean> {
    return this.commentsService.remove(idNews, params.id);
  }
}
