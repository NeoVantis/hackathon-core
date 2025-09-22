import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { AdminAuthGuard } from '../../common/guards/auth.guard';

@Controller('analytics')
@UseGuards(AdminAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overall')
  async getOverallAnalytics() {
    return this.analyticsService.getOverallAnalytics();
  }

  @Get('hackathon/:id')
  async getHackathonAnalytics(@Param('id', ParseUUIDPipe) id: string) {
    return this.analyticsService.getHackathonAnalytics(id);
  }

  @Get('team/:id')
  async getTeamAnalytics(@Param('id', ParseUUIDPipe) id: string) {
    return this.analyticsService.getTeamAnalytics(id);
  }

  @Get('export/hackathon/:id')
  async exportHackathonData(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('format') format: 'json' | 'csv' = 'json',
    @Res() res: Response,
  ) {
    const data = await this.analyticsService.exportHackathonData(id, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="hackathon-${id}-data.csv"`);
      return res.send(data);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="hackathon-${id}-data.json"`);
    return res.json(data);
  }
}