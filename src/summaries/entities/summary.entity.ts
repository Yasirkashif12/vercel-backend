import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
@Entity('summaries')
export class Summary {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('text')
  originalText: string;
  @Column('text')
  summary: string;
  @Column('json')
  actionItems: string[];
  @Column('json')
  risks: string[];
  @Column('json')
  nextSteps: string[];
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column()
  userId: number;
  @CreateDateColumn()
  createdAt: Date;
}
