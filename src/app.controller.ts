import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as os from 'os';
import { DataSource } from 'typeorm';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  async getHealth(): Promise<object> {
    const totalMemBytes = os.totalmem();
    const freeMemBytes = os.freemem();
    const usedMemBytes = totalMemBytes - freeMemBytes;
    const toMB = (bytes: number) => Math.round((bytes / 1024 / 1024) * 10) / 10;
    const memUsagePercent =
      Math.round((usedMemBytes / totalMemBytes) * 1000) / 10;

    const pmem = process.memoryUsage();

    // DB check and response time
    let dbStatus: 'healthy' | 'unhealthy' = 'healthy';
    let dbResponseTime = 0;
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      dbResponseTime = Date.now() - start;
    } catch {
      dbStatus = 'unhealthy';
    }

    const cpuInfo = os.cpus?.() || [];
    const firstCpu = cpuInfo[0];

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      memory: {
        total: toMB(totalMemBytes),
        free: toMB(freeMemBytes),
        used: toMB(usedMemBytes),
        usagePercent: memUsagePercent,
        process: {
          heapUsed: toMB(pmem.heapUsed),
          heapTotal: toMB(pmem.heapTotal),
          external: toMB(pmem.external || 0),
          rss: toMB(pmem.rss),
        },
      },
      cpu: {
        cores: cpuInfo.length,
        loadAverage: os.loadavg(),
        model: firstCpu?.model || 'unknown',
        speed: firstCpu?.speed || 0,
      },
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
      network: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
      },
    };
  }
}
