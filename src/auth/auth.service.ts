import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException,UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload-interface';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtservice:JwtService
  ) {
  }
      async signup(authcredentialdto:AuthCredentialsDto):Promise<void>{
        const {email,password}=authcredentialdto
        const existingUser=await this.userRepository.findOne({where:{email}})
        if(existingUser){
  throw new ConflictException('Email already exists');

        }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
  } catch (error) {
    throw new ConflictException('Failed to create user'); 
  }
}

async signin(authcredentialdto:AuthCredentialsDto):Promise<{accessToken:string}>{
  const {email,password}=authcredentialdto
  const user=await this.userRepository.findOne({where:{email}})
  if(!user){
throw new UnauthorizedException('Invalid credentials');
  }
  const isPasswordMatch=await bcrypt.compare(password,user.password)
  if(!isPasswordMatch){
    throw new UnauthorizedException('Invalid credentials');
  }
const payload: JwtPayload = { id: user.id, email: user.email };
const accessToken = this.jwtservice.sign(payload, { secret: process.env.SECRET }); 
return { accessToken };
}
}
