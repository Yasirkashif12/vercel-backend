import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSummaryDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}