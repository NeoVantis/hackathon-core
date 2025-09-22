import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hackathon } from '../../entities/hackathon.entity';
import { Team } from '../../entities/team.entity';
import { Submission } from '../../entities/submission.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Hackathon)
    private readonly hackathonRepository: Repository<Hackathon>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
  ) {}

  async getHackathonAnalytics(hackathonId: string): Promise<any> {
    const hackathon = await this.hackathonRepository.findOne({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new Error('Hackathon not found');
    }

    const teams = await this.teamRepository.find({
      where: { hackathonId },
    });

    const submissions = await this.submissionRepository.find({
      where: { hackathonId },
    });

    const analytics = {
      hackathon: {
        id: hackathon.id,
        title: hackathon.title,
        status: hackathon.status,
        mode: hackathon.mode,
        createdAt: hackathon.createdAt,
      },
      teams: {
        total: teams.length,
        byStatus: this.groupByField(teams, 'status'),
        bySubmissionStatus: this.groupByField(teams, 'submissionStatus'),
      },
      submissions: {
        total: submissions.length,
        byStatus: this.groupByField(submissions, 'status'),
        averageScore: submissions.length > 0 
          ? submissions.reduce((sum, sub) => sum + (sub.aiOverallScore || 0), 0) / submissions.length 
          : 0,
        scoreDistribution: this.getScoreDistribution(submissions),
      },
      participation: {
        submissionRate: teams.length > 0 ? (submissions.length / teams.length) * 100 : 0,
        completionRate: teams.length > 0 
          ? (teams.filter(t => t.submissionStatus === 'submitted').length / teams.length) * 100 
          : 0,
      },
      timeline: {
        dailyRegistrations: await this.getDailyRegistrations(hackathonId),
        dailySubmissions: await this.getDailySubmissions(hackathonId),
      },
    };

    return analytics;
  }

  async getOverallAnalytics(): Promise<any> {
    const totalHackathons = await this.hackathonRepository.count();
    const totalTeams = await this.teamRepository.count();
    const totalSubmissions = await this.submissionRepository.count();

    const hackathonsByStatus = await this.hackathonRepository
      .createQueryBuilder('hackathon')
      .select('hackathon.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('hackathon.status')
      .getRawMany();

    const hackathonsByMode = await this.hackathonRepository
      .createQueryBuilder('hackathon')
      .select('hackathon.mode', 'mode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('hackathon.mode')
      .getRawMany();

    const recentHackathons = await this.hackathonRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      select: ['id', 'title', 'status', 'mode', 'createdAt'],
    });

    return {
      totals: {
        hackathons: totalHackathons,
        teams: totalTeams,
        submissions: totalSubmissions,
        averageTeamsPerHackathon: totalHackathons > 0 ? totalTeams / totalHackathons : 0,
        averageSubmissionsPerHackathon: totalHackathons > 0 ? totalSubmissions / totalHackathons : 0,
      },
      distributions: {
        hackathonsByStatus: this.formatGroupedData(hackathonsByStatus),
        hackathonsByMode: this.formatGroupedData(hackathonsByMode),
      },
      recent: {
        hackathons: recentHackathons,
      },
    };
  }

  async getTeamAnalytics(teamId: string): Promise<any> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['submission'],
    });

    if (!team) {
      throw new Error('Team not found');
    }

    const analytics = {
      team: {
        id: team.id,
        name: team.name,
        status: team.status,
        submissionStatus: team.submissionStatus,
        createdAt: team.createdAt,
        aiScore: team.aiScore,
        eligibility: team.eligibility,
      },
      submission: team.submission ? {
        id: team.submission.id,
        title: team.submission.title,
        status: team.submission.status,
        submittedAt: team.submission.submittedAt,
        aiScore: team.submission.aiOverallScore,
        aiConfidence: team.submission.aiConfidence,
        hasGithub: !!team.submission.githubUrl,
        hasDemo: !!team.submission.demoUrl,
        hasPpt: !!team.submission.pptUrl,
      } : null,
    };

    return analytics;
  }

  async exportHackathonData(hackathonId: string, format: 'json' | 'csv' = 'json'): Promise<any> {
    const hackathon = await this.hackathonRepository.findOne({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new Error('Hackathon not found');
    }

    const teams = await this.teamRepository.find({
      where: { hackathonId },
      relations: ['submission'],
    });

    const data = {
      hackathon: {
        id: hackathon.id,
        title: hackathon.title,
        status: hackathon.status,
        mode: hackathon.mode,
        createdAt: hackathon.createdAt,
      },
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        status: team.status,
        submissionStatus: team.submissionStatus,
        createdAt: team.createdAt,
        aiScore: team.aiScore,
        eligibility: team.eligibility,
        submission: team.submission ? {
          id: team.submission.id,
          title: team.submission.title,
          description: team.submission.description,
          status: team.submission.status,
          submittedAt: team.submission.submittedAt,
          githubUrl: team.submission.githubUrl,
          demoUrl: team.submission.demoUrl,
          pptUrl: team.submission.pptUrl,
          aiOverallScore: team.submission.aiOverallScore,
          aiConfidence: team.submission.aiConfidence,
          aiFeedback: team.submission.aiFeedback,
        } : null,
      })),
    };

    if (format === 'csv') {
      return this.convertToCSV(data.teams);
    }

    return data;
  }

  private groupByField(items: any[], field: string): any {
    return items.reduce((acc, item) => {
      const key = item[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  private getScoreDistribution(submissions: any[]): any {
    const ranges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    submissions.forEach(sub => {
      const score = sub.aiOverallScore || 0;
      if (score <= 20) ranges['0-20']++;
      else if (score <= 40) ranges['21-40']++;
      else if (score <= 60) ranges['41-60']++;
      else if (score <= 80) ranges['61-80']++;
      else ranges['81-100']++;
    });

    return ranges;
  }

  private async getDailyRegistrations(hackathonId: string): Promise<any> {
    const registrations = await this.teamRepository
      .createQueryBuilder('team')
      .select('DATE(team.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('team.hackathonId = :hackathonId', { hackathonId })
      .groupBy('DATE(team.createdAt)')
      .orderBy('DATE(team.createdAt)', 'ASC')
      .getRawMany();

    return registrations;
  }

  private async getDailySubmissions(hackathonId: string): Promise<any> {
    const submissions = await this.submissionRepository
      .createQueryBuilder('submission')
      .select('DATE(submission.submittedAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('submission.hackathonId = :hackathonId', { hackathonId })
      .andWhere('submission.submittedAt IS NOT NULL')
      .groupBy('DATE(submission.submittedAt)')
      .orderBy('DATE(submission.submittedAt)', 'ASC')
      .getRawMany();

    return submissions;
  }

  private formatGroupedData(data: any[]): any {
    return data.reduce((acc, item) => {
      const key = Object.keys(item)[0];
      acc[item[key]] = parseInt(item.count);
      return acc;
    }, {});
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value).replace(/"/g, '""');
        }
        return `"${value}"`;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  }
}