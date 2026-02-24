import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKeyValue = request.headers['x-api-key'];

    if (!apiKeyValue) {
      throw new UnauthorizedException('API key is required');
    }

    // Validate against database
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { key: apiKeyValue },
    });

    if (!apiKey || !apiKey.active) {
      throw new UnauthorizedException('Invalid or inactive API key');
    }

    // Attach API key object to request for use in controllers
    request.apiKey = apiKey;

    return true;
  }
}
