import { Injectable, BadRequestException } from '@nestjs/common';
import { ArticleRepository } from '../repositories/article.repository';
import { CreateArticleDto } from '../dto/news.dto';

@Injectable()
export class NewsService {
  constructor(private articleRepository: ArticleRepository) {}

  async getAll() {
    return await this.articleRepository.find();
  }

  async getOne(id: number) {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new BadRequestException('Article not found');
    }

    return article;
  }

  async create(body: CreateArticleDto, userId: number) {
    return await this.articleRepository.save({
      ...body,
      userId,
    });
  }

  async update(id: number, body: CreateArticleDto) {
    await this.articleRepository.update(id, { ...body, updatedAt: new Date() });
    return { success: true };
  }

  async delete(id: number) {
    await this.articleRepository.delete(id);
    return { success: true };
  }

  async checkOwnership(id: number, userId: number) {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new BadRequestException('Article not found');
    }

    if (article.userId !== userId) {
      throw new BadRequestException('Article does not belong to the user');
    }

    return article;
  }
}
