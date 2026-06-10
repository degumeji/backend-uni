import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/presentation/guards/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Healthcheck del servicio' })
  async check() {
    const mongoState = this.mongoConnection?.readyState;
    const mongoOk = mongoState === 1; // 1 = connected
    return {
      status: mongoOk ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        mongo: mongoOk ? 'up' : 'down',
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
