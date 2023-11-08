import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { AccessTokenStrategy } from '../auth/strategies/accessToken.strategy';
import { RefreshTokenStrategy } from '../auth/strategies/refreshToken.strategy';
import { NewsController } from '../controllers/news.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { NewsService } from '../services/news.service';
import { ArticleRepository } from '../repositories/article.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    JwtModule.register({}),
  ],
  controllers: [NewsController],
  providers: [
    NewsService,
    ArticleRepository,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
})
export class NewsModule {}
