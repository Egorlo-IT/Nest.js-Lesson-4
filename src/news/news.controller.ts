import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Body,
  Res,
  HttpStatus,
  HttpException,
  UploadedFiles,
  UseInterceptors,
  Render,
} from '@nestjs/common';
import { Response } from 'express';
import { News } from './news.interface';
import { Comment } from './comments/comments.interface';
import { NewsService } from './news.service';
import { CommentsService } from './comments/comments.service';
import { NewsIdDto } from './dtos/news-id.dto';
import { NewsCreateDto } from './dtos/news-create.dto';
import { NewsEditDto } from './dtos/news-edit.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HelperFileLoader } from '../utils/HelperFileLoader';
import { imageFileFilter } from 'src/utils/imageFileFilter';
import { MailService } from 'src/mail/mail.service';

const PATH_NEWS = '/news-static/';
const helperFileLoader = new HelperFileLoader();
helperFileLoader.path = PATH_NEWS;

@Controller('news')
export class NewsController {
  constructor(
    private newsService: NewsService,
    private readonly commentService: CommentsService,
    private mailService: MailService,
  ) {}

  @Get('all')
  async getNews(): Promise<{ news: News[] }> {
    return this.newsService.findAll();
  }

  @Get(':id')
  async getById(
    @Param() params: NewsIdDto,
  ): Promise<{ newsDetail: News | null }> {
    return this.newsService.findByIndex(params.id);
  }

  @Post('create')
  @UseInterceptors(
    FilesInterceptor('cover', 1, {
      storage: diskStorage({
        destination: helperFileLoader.destinationPath,
        filename: helperFileLoader.customFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async create(
    @Body() news: NewsCreateDto,
    @UploadedFiles() cover: Express.Multer.File,
  ) {
    let coverPath: string;
    if (cover[0]?.filename?.length > 0) {
      coverPath = PATH_NEWS + cover[0].filename;
    }
    try {
      const _news: News = this.newsService.create({
        ...news,
        cover: coverPath,
      });
      await this.mailService.sendNewNewsForAdmins(
        ['egorlo@mail.ru', 'egorlo059@gmail.com'],
        _news,
      );
      return _news;
    } catch (error) {
      console.log(error);
    }
  }

  @Post('edit')
  @UseInterceptors(
    FilesInterceptor('cover', 1, {
      storage: diskStorage({
        destination: helperFileLoader.destinationPath,
        filename: helperFileLoader.customFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async edit(
    @Body() news: NewsEditDto,
    @UploadedFiles() cover: Express.Multer.File,
    @Res() response: Response,
  ) {
    let coverPath: string;
    if (cover[0]?.filename?.length > 0) {
      coverPath = PATH_NEWS + cover[0].filename;
    }

    const previousNews: News = this.newsService.edit({
      ...news,
      cover: coverPath,
    });
    if (previousNews !== null) {
      await this.mailService.sendEditNewsForAdmins(
        ['egorlo@mail.ru', 'egorlo059@gmail.com'],
        {
          ...news,
          cover: coverPath,
        },
        previousNews,
      );

      return response
        .status(200)
        .send(
          `Новость с идентификатором id: ${news.id} успешно отредактирована`,
        );
    } else {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Новость с идентификатором id: ${news.id} не найдена!`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param() params: NewsIdDto): Promise<boolean> {
    return (
      this.newsService.remove(params.id) &&
      this.commentService.removeAll(params.id)
    );
  }

  @Get()
  @Render('news-list')
  async getViewAll(): Promise<{ news: News[] }> {
    return this.newsService.findAll();
  }

  @Get(':id/detail')
  @Render('news-details')
  async getByIdDetail(
    @Param() params: NewsIdDto,
  ): Promise<{ news: { newsDetail: News }; comments: { comment: Comment } }> {
    const news = this.newsService.findByIndex(params.id);
    const comments = this.commentService.findAll(params.id);
    console.dir(comments);

    const newsDetail = { news, comments };
    return newsDetail;
  }
}
