import {
  Controller,
  Body,
  HttpCode,
  Get,
  UseGuards,
  Put,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { NewsService } from '../services/news.service';
import { AccessTokenGuard } from '../guards/accessToken.guard';
import { CreateArticleDto, UpdateArticleDto } from '../dto/news.dto';
import { Request } from 'express';
import { OwnershipGuard } from '../guards/ownership.guard';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  getAll() {
    return this.newsService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.newsService.getOne(id);
  }

  @Put()
  @HttpCode(201)
  @UseGuards(AccessTokenGuard)
  async create(@Body() body: CreateArticleDto, @Req() req: Request) {
    return await this.newsService.create(body, req.user['sub']);
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard, OwnershipGuard)
  async update(@Param('id') id: number, @Body() body: UpdateArticleDto) {
    return await this.newsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard, OwnershipGuard)
  async delete(@Param('id') id: number) {
    return await this.newsService.delete(id);
  }
}
