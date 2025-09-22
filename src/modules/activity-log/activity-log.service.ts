import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../entities/activity-log.entity';

export interface LogActivityDto {
  userId?: string;
  adminId?: string;
  hackathonId?: string;
  teamId?: string;
  submissionId?: string;
  action: string;
  details?: object;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async logActivity(logData: LogActivityDto): Promise<ActivityLog> {
    const activityLog = this.activityLogRepository.create({
      ...logData,
      timestamp: new Date(),
    });

    return this.activityLogRepository.save(activityLog);
  }

  async getActivityLogs(
    hackathonId?: string,
    userId?: string,
    adminId?: string,
    action?: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ logs: ActivityLog[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.activityLogRepository.createQueryBuilder('log');

    if (hackathonId) {
      queryBuilder.andWhere('log.hackathonId = :hackathonId', { hackathonId });
    }

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (adminId) {
      queryBuilder.andWhere('log.adminId = :adminId', { adminId });
    }

    if (action) {
      queryBuilder.andWhere('log.action ILIKE :action', { action: `%${action}%` });
    }

    queryBuilder
      .orderBy('log.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRecentActivity(limit: number = 20): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getActivitySummary(
    hackathonId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const queryBuilder = this.activityLogRepository.createQueryBuilder('log');

    if (hackathonId) {
      queryBuilder.andWhere('log.hackathonId = :hackathonId', { hackathonId });
    }

    if (startDate) {
      queryBuilder.andWhere('log.timestamp >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('log.timestamp <= :endDate', { endDate });
    }

    const actionStats = await queryBuilder
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.action')
      .orderBy('count', 'DESC')
      .getRawMany();

    const dailyActivity = await queryBuilder
      .select('DATE(log.timestamp)', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(log.timestamp)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const totalActivities = await queryBuilder.getCount();

    return {
      totalActivities,
      actionStats: actionStats.map(stat => ({
        action: stat.action,
        count: parseInt(stat.count),
      })),
      dailyActivity: dailyActivity.map(day => ({
        date: day.date,
        count: parseInt(day.count),
      })),
    };
  }

  // Helper methods for common activities
  async logUserRegistration(userId: string, hackathonId: string, ipAddress?: string): Promise<void> {
    await this.logActivity({
      userId,
      hackathonId,
      action: 'USER_REGISTRATION',
      details: { event: 'User registered for hackathon' },
      ipAddress,
    });
  }

  async logTeamCreation(userId: string, hackathonId: string, teamId: string, ipAddress?: string): Promise<void> {
    await this.logActivity({
      userId,
      hackathonId,
      teamId,
      action: 'TEAM_CREATION',
      details: { event: 'Team created' },
      ipAddress,
    });
  }

  async logSubmissionCreated(userId: string, hackathonId: string, teamId: string, submissionId: string, ipAddress?: string): Promise<void> {
    await this.logActivity({
      userId,
      hackathonId,
      teamId,
      submissionId,
      action: 'SUBMISSION_CREATED',
      details: { event: 'Submission created' },
      ipAddress,
    });
  }

  async logAdminAction(adminId: string, action: string, details: object, ipAddress?: string): Promise<void> {
    await this.logActivity({
      adminId,
      action: `ADMIN_${action.toUpperCase()}`,
      details,
      ipAddress,
    });
  }

  async logHackathonStatusChange(adminId: string, hackathonId: string, oldStatus: string, newStatus: string, ipAddress?: string): Promise<void> {
    await this.logActivity({
      adminId,
      hackathonId,
      action: 'HACKATHON_STATUS_CHANGE',
      details: { 
        event: 'Hackathon status changed',
        oldStatus,
        newStatus,
      },
      ipAddress,
    });
  }
}