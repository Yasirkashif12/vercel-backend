import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload-interface';
import { hashPassword, comparePasswords } from './utils/password.utils';
import { generateAccessToken } from './utils/jwt.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: AuthCredentialsDto): Promise<void> {
    await this.verifyEmailIsUnique(dto.email);

    const hashedPassword = await this.hashPlainPassword(dto.password);

    const user = this.buildUserEntity(dto.email, hashedPassword);

    await this.persistUser(user);
  }

  async signin(dto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const user = await this.getValidatedUser(dto.email, dto.password);

    const token = this.issueJwtToken(user);

    return { accessToken: token };
  }

  private async verifyEmailIsUnique(email: string): Promise<void> {
    const exists = await this.userRepository.findOne({
      where: { email },
    });

    if (exists) {
      throw new ConflictException('Email already exists');
    }
  }

  private async hashPlainPassword(password: string): Promise<string> {
    return hashPassword(password); // util
  }

  private buildUserEntity(email: string, password: string): User {
    return this.userRepository.create({
      email,
      password,
    });
  }

  private async persistUser(user: User): Promise<void> {
    await this.userRepository.save(user);
  }

  private async getValidatedUser(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.findUserByEmail(email);

    await this.ensurePasswordIsCorrect(password, user.password);

    return user;
  }

  private async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async ensurePasswordIsCorrect(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<void> {
    const isValid = await comparePasswords(plainPassword, hashedPassword);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private issueJwtToken(user: User): string {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
    };

    return generateAccessToken(this.jwtService, payload);
  }
}
