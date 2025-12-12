import { Controller, Post, Body, Get, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { SummariesService } from './summaries.service';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import type { Request } from 'express';

@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {

    constructor(private readonly summariesService: SummariesService) { }

    @Post('/post')
    async create(
        @Body(ValidationPipe) createSummaryDto: CreateSummaryDto,
        @Req() request: Request,
    ) {
        const userId = request['user']?.id;
        return await this.summariesService.createSummary(createSummaryDto, userId);
    }

    @Get('/get')
    async getUserSummaries(
        @Req() request: Request,
    ) {
        const userId = request['user']?.id;
        return await this.summariesService.getUserSummaries(userId);
    }
}
