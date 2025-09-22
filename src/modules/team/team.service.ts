import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, TeamStatus } from '../../entities/team.entity';
import { Hackathon } from '../../entities/hackathon.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Hackathon)
    private readonly hackathonRepository: Repository<Hackathon>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    // Check if hackathon exists
    const hackathon = await this.hackathonRepository.findOne({
      where: { id: createTeamDto.hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${createTeamDto.hackathonId} not found`);
    }

    // Check if team name is unique within the hackathon
    const existingTeam = await this.teamRepository.findOne({
      where: { 
        name: createTeamDto.name,
        hackathonId: createTeamDto.hackathonId,
      },
    });

    if (existingTeam) {
      throw new BadRequestException('Team name already exists in this hackathon');
    }

    const team = this.teamRepository.create(createTeamDto);
    return this.teamRepository.save(team);
  }

  async findAll(
    hackathonId?: string,
    status?: TeamStatus,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ teams: Team[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.teamRepository.createQueryBuilder('team');

    if (hackathonId) {
      queryBuilder.andWhere('team.hackathonId = :hackathonId', { hackathonId });
    }

    if (status) {
      queryBuilder.andWhere('team.status = :status', { status });
    }

    queryBuilder
      .orderBy('team.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [teams, total] = await queryBuilder.getManyAndCount();

    return {
      teams,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['hackathon', 'submission'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    await this.teamRepository.update(id, updateTeamDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
  }

  async getTeamStats(teamId: string): Promise<any> {
    const team = await this.findOne(teamId);

    const stats = {
      status: team.status,
      submissionStatus: team.submissionStatus,
      createdAt: team.createdAt,
      hasSubmission: !!team.submission,
      aiScore: team.aiScore,
      eligibility: team.eligibility,
    };

    return stats;
  }
}