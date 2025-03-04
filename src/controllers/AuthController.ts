import { Post, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../services/AuthService';

@Post('logout')
async logout(@Req() req: Request) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new UnauthorizedException('Token não fornecido');
  }

  await this.authService.logout(token);
  
  return {
    message: 'Logout realizado com sucesso'
  };
} 