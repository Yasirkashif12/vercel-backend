import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { config } from 'dotenv';
import { Summary } from './entities/summary.entity';
import { CreateSummaryDto } from './dto/create-summary.dto';

config();

@Injectable()
export class SummariesService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Summary)
    private summaryRepository: Repository<Summary>,
  ) {
    this.openai = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY || '',
    });
  }

  async createSummary(
    createSummaryDto: CreateSummaryDto,
    userId: number,
  ): Promise<Summary> {
    const { content } = createSummaryDto;

    try {
      const summaryResponse = await this.openai.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that summarizes text concisely.',
          },
          {
            role: 'user',
            content: `Please summarize the following text:\n\n${content}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const aiSummary =
        summaryResponse.choices[0].message.content || 'No summary generated.';

      const extractionPrompt = `Analyze the following text and extract actionable insights.
            
Text: ${content}

Please provide your response in the following strict format:

ACTION_ITEMS:
- item 1
- item 2

RISKS:
- item 1
- item 2

NEXT_STEPS:
- item 1
- item 2`;

      const extractionResponse = await this.openai.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert analyst. Extract structured information from the text.',
          },
          { role: 'user', content: extractionPrompt },
        ],
        max_tokens: 500,
        temperature: 0.2,
      });

      const extractedData = this.parseExtractionResponse(
        extractionResponse.choices[0].message.content || '',
      );

      const summary = this.summaryRepository.create({
        originalText: content,
        summary: aiSummary,
        actionItems: extractedData.actionItems,
        risks: extractedData.risks,
        nextSteps: extractedData.nextSteps,
        userId: userId,
      });

      return await this.summaryRepository.save(summary);
    } catch (error) {
      console.error('Error creating summary:', error);
      if (error instanceof OpenAI.APIError && error.status === 401) {
        throw new Error(
          'Groq API authentication failed. Please check your GROQ_API_KEY in .env file.',
        );
      }
      throw new Error(`Failed to create summary: ${error.message}`);
    }
  }

  private parseExtractionResponse(response: string): {
    actionItems: string[];
    risks: string[];
    nextSteps: string[];
  } {
    const result = {
      actionItems: [] as string[],
      risks: [] as string[],
      nextSteps: [] as string[],
    };

    try {
      const sections = response.split(/(?=ACTION_ITEMS:|RISKS:|NEXT_STEPS:)/);

      sections.forEach((section) => {
        const trimmedSection = section.trim();
        let category: 'actionItems' | 'risks' | 'nextSteps' | null = null;

        if (trimmedSection.startsWith('ACTION_ITEMS:'))
          category = 'actionItems';
        else if (trimmedSection.startsWith('RISKS:')) category = 'risks';
        else if (trimmedSection.startsWith('NEXT_STEPS:'))
          category = 'nextSteps';

        if (category) {
          const lines = trimmedSection
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.startsWith('-'));

          const items = lines.map((line) => line.replace(/^-\s*/, '').trim());

          if (items.length > 0) {
            result[category] = items;
          }
        }
      });

      if (result.actionItems.length === 0)
        result.actionItems.push('No specific action items identified');
      if (result.risks.length === 0) result.risks.push('No risks identified');
      if (result.nextSteps.length === 0)
        result.nextSteps.push('No next steps identified');
    } catch (error) {
      console.error('Error parsing extraction response:', error);
      return {
        actionItems: ['Unable to extract action items'],
        risks: ['Unable to extract risks'],
        nextSteps: ['Unable to extract next steps'],
      };
    }

    return result;
  }

  async getUserSummaries(userId: number): Promise<Summary[]> {
    return await this.summaryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
