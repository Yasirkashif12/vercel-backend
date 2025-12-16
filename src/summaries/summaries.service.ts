import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { config } from 'dotenv';

import { Summary } from './entities/summary.entity';
import { CreateSummaryDto } from './dto/create-summary.dto';

import { parseExtractionResponse } from './utils/extraction-parser.util';
import { buildExtractionPrompt } from './utils/prompt.util';
import { buildSummaryPrompt } from './utils/prompt.util';
import { ExtractedData } from './utils/extraction-parser.util';
config();

@Injectable()
export class SummariesService {
  private readonly openai: OpenAI;

  constructor(
    @InjectRepository(Summary)
    private readonly summaryRepository: Repository<Summary>,
  ) {
    this.openai = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY || '',
    });
  }

  async createSummary(dto: CreateSummaryDto, userId: number): Promise<Summary> {
    const summaryText = await this.generateSummary(dto.content);

    const extractedData = await this.extractInsights(dto.content);

    const summaryEntity = this.buildSummaryEntity(
      dto.content,
      summaryText,
      extractedData,
      userId,
    );

    return this.saveSummary(summaryEntity);
  }

  async getUserSummaries(userId: number): Promise<Summary[]> {
    return this.summaryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  private async generateSummary(content: string): Promise<string> {
    const response = await this.callOpenAI(
      buildSummaryPrompt(content),
      150,
      0.7,
      'You are a helpful assistant that summarizes text concisely.',
    );

    return response || 'No summary generated.';
  }

  private async extractInsights(content: string): Promise<ExtractedData> {
    const response = await this.callOpenAI(
      buildExtractionPrompt(content),
      500,
      0.2,
      'You are an expert analyst. Extract structured information.',
    );

    return parseExtractionResponse(response || '');
  }

  private async callOpenAI(
    userPrompt: string,
    maxTokens: number,
    temperature: number,
    systemPrompt: string,
  ): Promise<string | null> {
    const response = await this.openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    });

    return response.choices[0]?.message?.content ?? null;
  }

  private buildSummaryEntity(
    originalText: string,
    summary: string,
    extracted: ExtractedData,
    userId: number,
  ): Summary {
    return this.summaryRepository.create({
      originalText,
      summary,
      actionItems: extracted.actionItems,
      risks: extracted.risks,
      nextSteps: extracted.nextSteps,
      userId,
    });
  }

  private async saveSummary(summary: Summary): Promise<Summary> {
    return this.summaryRepository.save(summary);
  }
}
