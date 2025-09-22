import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const enabled = this.config.get<string>('API_KEY_ENABLED');
    if (enabled && enabled.toLowerCase() === 'false') return true;

    const request = context.switchToHttp().getRequest<Request>();

    // Allow Swagger docs and JSON to be publicly accessible
    const path = request.path || '';
    if (path.startsWith('/docs') || path.includes('swagger')) return true;

    const headers = request.headers as Record<
      string,
      string | string[] | undefined
    >;
    // Normalize common header variants
    const rawHeader =
      headers['x-api-key'] ||
      headers['x-apikey'] ||
      headers['x-api_key'] ||
      headers['x-apiKey'];
    const headerVal = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    const queryKey = (request.query?.api_key || request.query?.apiKey) as
      | string
      | undefined;
    const candidate = headerVal || queryKey;

    if (!candidate) return false;

    const allowed =
      this.config.get<string>('API_KEYS') ||
      this.config.get<string>('API_KEY') ||
      '';
    const allowedList = allowed
      .split(',')
      .map((s) => s.trim())
      .filter((s) => !!s);

    if (allowedList.length === 0) return false;

    return allowedList.includes(candidate);
  }
}
