import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission, SubmissionStatus } from '../../entities/submission.entity';
import { Team } from '../../entities/team.entity';
import { Hackathon } from '../../entities/hackathon.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Hackathon)
    private readonly hackathonRepository: Repository<Hackathon>,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    // Check if hackathon exists
    const hackathon = await this.hackathonRepository.findOne({
      where: { id: createSubmissionDto.hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${createSubmissionDto.hackathonId} not found`);
    }

    // Check if team exists
    const team = await this.teamRepository.findOne({
      where: { id: createSubmissionDto.teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${createSubmissionDto.teamId} not found`);
    }

    // Check if team already has a submission for this hackathon
    const existingSubmission = await this.submissionRepository.findOne({
      where: {
        teamId: createSubmissionDto.teamId,
        hackathonId: createSubmissionDto.hackathonId,
      },
    });

    if (existingSubmission) {
      throw new BadRequestException('Team already has a submission for this hackathon');
    }

    const submission = this.submissionRepository.create(createSubmissionDto);
    return this.submissionRepository.save(submission);
  }

  async findAll(
    hackathonId?: string,
    teamId?: string,
    status?: SubmissionStatus,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ submissions: Submission[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.submissionRepository.createQueryBuilder('submission');

    if (hackathonId) {
      queryBuilder.andWhere('submission.hackathonId = :hackathonId', { hackathonId });
    }

    if (teamId) {
      queryBuilder.andWhere('submission.teamId = :teamId', { teamId });
    }

    if (status) {
      queryBuilder.andWhere('submission.status = :status', { status });
    }

    queryBuilder
      .orderBy('submission.submittedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [submissions, total] = await queryBuilder.getManyAndCount();

    return {
      submissions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Submission> {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: ['team', 'hackathon'],
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    return submission;
  }

  async update(id: string, updateSubmissionDto: UpdateSubmissionDto): Promise<Submission> {
    const submission = await this.findOne(id);
    await this.submissionRepository.update(id, updateSubmissionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const submission = await this.findOne(id);
    await this.submissionRepository.remove(submission);
  }

  async getSubmissionsByHackathon(hackathonId: string): Promise<Submission[]> {
    return this.submissionRepository.find({
      where: { hackathonId },
      relations: ['team'],
      order: { submittedAt: 'DESC' },
    });
  }

  async getSubmissionsByTeam(teamId: string): Promise<Submission[]> {
    return this.submissionRepository.find({
      where: { teamId },
      relations: ['hackathon'],
      order: { submittedAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: SubmissionStatus): Promise<Submission> {
    const submission = await this.findOne(id);
    await this.submissionRepository.update(id, { status });
    return this.findOne(id);
  }

  async getSubmissionStats(id: string): Promise<any> {
    const submission = await this.findOne(id);

    const stats = {
      status: submission.status,
      submittedAt: submission.submittedAt,
      hasGithub: !!submission.githubUrl,
      hasDemo: !!submission.demoUrl,
      hasPpt: !!submission.pptUrl,
      hasOtherLinks: submission.otherLinks && submission.otherLinks.length > 0,
      teamId: submission.teamId,
      hackathonId: submission.hackathonId,
      aiScore: submission.aiOverallScore,
      aiConfidence: submission.aiConfidence,
    };

    return stats;
  }
}