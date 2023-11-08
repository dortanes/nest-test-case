import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Article } from '../entities/article.entity';

@Injectable()
export class ArticleRepository extends Repository<Article> {
  constructor(private dataSource: DataSource) {
    super(Article, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Article> {
    return await this.findOne({ where: { id } });
  }
}
