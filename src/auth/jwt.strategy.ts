import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  //canActivate special classes that decide if a route can be accessed or not

  canActivate(context: ExecutionContext): boolean {
    console.log('Before ', context);
    const request = context.switchToHttp().getRequest<Request>();
    console.log('After', request);
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('No token provided');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid token');

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.SECRET,
      });
      request['user'] = payload;
      return true;
    } catch (err) {
      console.log('JWT verify error:', err.message);

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
