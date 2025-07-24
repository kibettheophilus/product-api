// src/auth/guards/jwt-auth.guard.ts

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug('Route is public, skipping authentication');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    this.logger.debug(`Auth header: ${authHeader ? 'Present' : 'Missing'}`);

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      this.logger.debug(`Token length: ${token ? token.length : 0}`);
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    this.logger.debug(
      `JWT Validation - Error: ${err?.message || 'None'}, User: ${user ? 'Present' : 'Missing'}, Info: ${info?.name || 'None'}`,
    );

    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        this.logger.warn('Token has expired');
        throw new UnauthorizedException('Token has expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        this.logger.warn(`Invalid token: ${info.message}`);
        throw new UnauthorizedException('Invalid token');
      }
      if (info?.name === 'NotBeforeError') {
        this.logger.warn('Token not active yet');
        throw new UnauthorizedException('Token not active');
      }
      this.logger.error(
        `Authentication failed: ${err?.message || info?.message || 'Unknown error'}`,
      );
      throw err || new UnauthorizedException('Authentication required');
    }

    this.logger.debug(`User authenticated successfully: ${user.email}`);
    return user;
  }
}
