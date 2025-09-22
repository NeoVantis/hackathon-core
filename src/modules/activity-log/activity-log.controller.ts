import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { AdminAuthGuard } from '../../common/guards/auth.guard';

@Controller('activity-logs')
@UseGuards(AdminAuthGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  async getActivityLogs(
    @Query('hackathonId') hackathonId?: string,
    @Query('userId') userId?: string,
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.activityLogService.getActivityLogs(
      hackathonId,
      userId,
      adminId,
      action,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('recent')
  async getRecentActivity(@Query('limit') limit: string = '20') {
    return this.activityLogService.getRecentActivity(parseInt(limit));
  }

  @Get('summary')
  async getActivitySummary(
    @Query('hackathonId') hackathonId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.activityLogService.getActivitySummary(hackathonId, start, end);
  }
}