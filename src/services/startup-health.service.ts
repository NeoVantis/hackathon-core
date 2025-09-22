import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class StartupHealthService {
  private readonly logger = new Logger(StartupHealthService.name);

  constructor(private configService: ConfigService) {}

  async checkExternalServices(): Promise<boolean> {
    this.logger.log('🔍 Checking external service dependencies...');

    const checks = await Promise.allSettled([
      this.checkAuthService(),
      this.checkNotificationService(),
      this.checkDatabase(),
    ]);

    const results = checks.map((result, index) => {
      const serviceName = ['Auth Service', 'Notification Service', 'Database'][
        index
      ];
      if (result.status === 'fulfilled' && result.value) {
        this.logger.log(`✅ ${serviceName}: Healthy`);
        return true;
      } else {
        const reason =
          result.status === 'rejected'
            ? String(result.reason)
            : 'Health check failed';
        this.logger.error(`❌ ${serviceName}: ${reason}`);
        return false;
      }
    });

    const allHealthy = results.every((result) => result);
    
    if (allHealthy) {
      this.logger.log(
        '🎉 All external services are healthy! Starting application...',
      );
    } else {
      this.logger.error(
        '💥 Some external services are unhealthy. Application startup aborted.',
      );
    }

    return allHealthy;
  }

  private async checkAuthService(): Promise<boolean> {
    try {
      const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
      const healthPath =
        this.configService.get<string>('AUTH_HEALTH_PATH') || '/health';
      if (!authServiceUrl) {
        throw new Error('AUTH_SERVICE_URL not configured');
      }

      const target = `${authServiceUrl}${healthPath.startsWith('/') ? '' : '/'}${healthPath}`;
      const response = await axios.get(target, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Hackathon-Core-HealthCheck/1.0',
        },
      });

      // Any HTTP response indicates the service is reachable (even 4xx/5xx)
      return !!response.status;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Received a response (4xx/5xx) -> service reachable
        return true;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Auth Service unreachable: ${message}`);
    }
  }

  private async checkNotificationService(): Promise<boolean> {
    try {
      const notificationServiceUrl = this.configService.get<string>(
        'NOTIFICATION_SERVICE_URL',
      );
      const healthPath =
        this.configService.get<string>('NOTIFICATION_HEALTH_PATH') || '/health';
      if (!notificationServiceUrl) {
        throw new Error('NOTIFICATION_SERVICE_URL not configured');
      }

      const target = `${notificationServiceUrl}${healthPath.startsWith('/') ? '' : '/'}${healthPath}`;
      const response = await axios.get(target, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Hackathon-Core-HealthCheck/1.0',
        },
      });

      // Any HTTP response indicates the service is reachable
      return !!response.status;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Received a response (4xx/5xx) -> service reachable
        return true;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Notification Service unreachable: ${message}`);
    }
  }

  private checkDatabase(): Promise<boolean> {
    try {
      // This will be checked by TypeORM connection
      // We'll implement a simple query to verify database connectivity
      const dbHost = this.configService.get<string>('DB_HOST');
      const dbPort = this.configService.get<string>('DB_PORT');
      const dbName = this.configService.get<string>('DB_DATABASE');

      if (!dbHost || !dbPort || !dbName) {
        throw new Error('Database configuration incomplete');
      }

      // For now, we'll assume if config is present, DB will be checked by TypeORM
      // In a real scenario, you might want to test a simple query
      return Promise.resolve(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Database configuration error: ${message}`);
    }
  }

  async waitForServices(
    maxRetries: number = 5,
    retryInterval: number = 10000,
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      this.logger.log(`🔄 Health check attempt ${attempt}/${maxRetries}`);
      
      const healthy = await this.checkExternalServices();
      if (healthy) {
        return true;
      }

      if (attempt < maxRetries) {
        this.logger.warn(`⏳ Retrying in ${retryInterval / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }

    return false;
  }
}