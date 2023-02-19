import { Injectable } from '@nestjs/common';
import { News } from './news.interface';

@Injectable()
export class NewsService {
  private readonly news: News[] = [];

  create(news: News): News {
    this.news.push({
      id: String(this.news.length + 1),
      title: news.title,
      description: news.description,
      author: news.author,
      createdAt: new Date().toLocaleString(),
      cover: news.cover,
    });
    return this.news[this.news.length - 1];
  }

  findAll(): { news: News[] } {
    return { news: this.news };
  }

  findByIndex(index: string): { newsDetail: News | null } {
    console.assert(
      typeof this.news[+index - 1] !== 'undefined',
      '[findByIndex] Invalid',
    );

    if (typeof this.news[+index - 1] !== 'undefined') {
      return { newsDetail: this.news[+index - 1] };
    }
    return null;
  }

  edit(news: News): News | null {
    for (const i in this.news) {
      if (this.news[i].id === news.id) {
        const previousNews: News = Object.assign({}, this.news[i]);
        console.log('previousNews', previousNews);

        this.news[i].title = news.title;
        this.news[i].description = news.description;
        this.news[i].author = news.author;
        this.news[i].cover = news.cover;
        return previousNews;
      }
    }
    return null;
  }

  async remove(idNews: string): Promise<boolean> {
    const index = this.news.findIndex((obj) => obj.id === idNews);
    if (index !== -1) {
      this.news.splice(index, 1);
      return true;
    }
    return false;
  }
}
