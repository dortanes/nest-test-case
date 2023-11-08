import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ArticleRepository } from '../repositories/article.repository';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private articleRepository: ArticleRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Get user id and article id from the request
    const userId = request.user['sub'];
    const articleId = request.params.id;
    // Get the article
    const article = await this.articleRepository.findById(articleId);
    // Check if article exists and belongs to the user
    if (!article || article.userId !== userId) {
      return false;
    }

    return true;
  }
}
