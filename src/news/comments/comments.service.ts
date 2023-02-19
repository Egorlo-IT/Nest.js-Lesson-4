import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { News } from '../news.interface';

@Injectable()
export class CommentsService {
  private readonly comments = {};
  private findAndReplace(object, idComment, replacevalue) {
    for (const x in object) {
      if (object.hasOwnProperty(x)) {
        if (typeof object[x] == 'object') {
          this.findAndReplace(object[x], idComment, replacevalue);
        }
        if (object[x] == idComment) {
          object['comment'] = replacevalue;
          return true;
        }
      }
    }
  }

  private findAndAddReplayComment(object, idComment, comment, avatarPath) {
    for (const x in object) {
      if (object.hasOwnProperty(x)) {
        if (typeof object[x] == 'object') {
          this.findAndAddReplayComment(
            object[x],
            idComment,
            comment,
            avatarPath,
          );
        }
        if (object[x] == idComment) {
          if (!object?.['reply']) {
            object['reply'] = [];
          }
          object['reply'].push({
            id: uuidv4(),
            comment,
            avatarPath,
          });
          return true;
        }
      }
    }
  }

  async create(
    idNews: string,
    idComment: string,
    comment: string,
    avatarPath: string,
  ): Promise<number> {
    if (idComment == null) {
      if (!this.comments?.[idNews]) {
        this.comments[idNews] = [];
      }
      return this.comments[idNews].push({
        id: uuidv4(),
        comment,
        avatarPath,
      });
    } else {
      this.findAndAddReplayComment(
        this.comments,
        idComment,
        comment,
        avatarPath,
      );
    }
  }

  findAll(idNews: string) {
    return this.comments?.[idNews];
  }

  async remove(idNews: string, idComment: string): Promise<boolean> {
    const index = this.comments?.[idNews].findIndex(
      (x: News) => x.id === idComment,
    );
    if (index !== -1) {
      this.comments[idNews].splice(index, 1);
      return true;
    }
    return false;
  }

  async removeAll(idNews: string): Promise<boolean> {
    return delete this.comments?.[idNews];
  }

  async edit(idComment: string, comment: string): Promise<boolean> {
    return this.findAndReplace(this.comments, idComment, comment);
  }
}
