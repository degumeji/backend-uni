import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisBlacklistService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisBlacklistService.name);
  private readonly prefix = 'bl:'; // blacklist prefix

  constructor(private readonly config: ConfigService) {
    // Soporte para Upstash (REDIS_URL) o Redis local (REDIS_HOST + REDIS_PORT)
    const redisUrl = this.config.get<string>('REDIS_URL');

    if (redisUrl) {
      // Upstash en producción (usa TLS)
      this.client = new Redis(redisUrl, {
        tls: { rejectUnauthorized: false },
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    } else {
      this.client = new Redis({
        host: this.config.get<string>('REDIS_HOST', 'localhost'),
        port: this.config.get<number>('REDIS_PORT', 6379),
        password: this.config.get<string>('REDIS_PASSWORD') || undefined,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    }

    this.client.on('connect', () => this.logger.log('Redis connected ✅'));
    this.client.on('error', (err) => this.logger.error('Redis error:', err.message));
  }

  async add(token: string, ttlSeconds: number): Promise<void> {
    try {
      // Guardamos el token con TTL para que Redis lo limpie automáticamente
      await this.client.setex(`${this.prefix}${token}`, ttlSeconds, '1');
    } catch (err) {
      this.logger.error('Error al agregar token a blacklist:', err);
    }
  }

  async has(token: string): Promise<boolean> {
    try {
      const result = await this.client.get(`${this.prefix}${token}`);
      return result !== null;
    } catch (err) {
      this.logger.error('Error al verificar blacklist:', err);
      return false; // En caso de error, no bloqueamos (fail-open)
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
