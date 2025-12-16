import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../jwt-payload-interface';

export const generateAccessToken = (
  jwtService: JwtService,
  payload: JwtPayload,
): string => {
  return jwtService.sign(payload);
};
