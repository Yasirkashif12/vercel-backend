import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';

config();

import { TypeOrmModule } from '@nestjs/typeorm';

import { SummariesController } from './summaries.controller';

import { SummariesService } from './summaries.service';

import { Summary } from './entities/summary.entity';

import { User } from '../user/user.entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([Summary, User]),

        JwtModule.register({
            secret: process.env.SECRET,
            signOptions: { expiresIn: 36000 },
        }),
    ],

    controllers: [SummariesController],

    providers: [SummariesService, JwtAuthGuard],
})
export class SummariesModule { }
