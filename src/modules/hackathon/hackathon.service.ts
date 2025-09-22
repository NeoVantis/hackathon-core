import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hackathon, HackathonStatus } from '../../entities/hackathon.entity';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';

@Injectable()
export class HackathonService {
  constructor(
    @InjectRepository(Hackathon)
    private readonly hackathonRepository: Repository<Hackathon>,
  ) {}

  async create(createHackathonDto: CreateHackathonDto, organizerId: string): Promise<Hackathon> {
    const hackathon = this.hackathonRepository.create({
      ...createHackathonDto,
      organizerId,
    });

    return this.hackathonRepository.save(hackathon);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: HackathonStatus,
    organizerId?: string,
  ): Promise<{ hackathons: Hackathon[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.hackathonRepository.createQueryBuilder('hackathon');

    if (status) {
      queryBuilder.andWhere('hackathon.status = :status', { status });
    }

    if (organizerId) {
      queryBuilder.andWhere('hackathon.organizerId = :organizerId', { organizerId });
    }

    queryBuilder
      .orderBy('hackathon.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [hackathons, total] = await queryBuilder.getManyAndCount();

    return {
      hackathons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Hackathon> {
    const hackathon = await this.hackathonRepository.findOne({
      where: { id },
      relations: ['teams', 'submissions', 'events'],
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${id} not found`);
    }

    return hackathon;
  }

  async findBySlug(slug: string): Promise<Hackathon> {
    // Since slug property doesn't exist in entity, we'll search by title for now
    const hackathon = await this.hackathonRepository.findOne({
      where: { title: slug },
      relations: ['teams', 'submissions'],
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with slug ${slug} not found`);
    }

    return hackathon;
  }

  async update(
    id: string,
    updateHackathonDto: UpdateHackathonDto,
    organizerId?: string,
  ): Promise<Hackathon> {
    const hackathon = await this.findOne(id);

    // Check if user is the organizer (if organizerId is provided)
    if (organizerId && hackathon.organizerId !== organizerId) {
      throw new ForbiddenException('You can only update hackathons you organize');
    }

    await this.hackathonRepository.update(id, updateHackathonDto);
    return this.findOne(id);
  }

  async remove(id: string, organizerId?: string): Promise<void> {
    const hackathon = await this.findOne(id);

    // Check if user is the organizer (if organizerId is provided)
    if (organizerId && hackathon.organizerId !== organizerId) {
      throw new ForbiddenException('You can only delete hackathons you organize');
    }

    await this.hackathonRepository.remove(hackathon);
  }

  async publish(id: string, organizerId?: string): Promise<Hackathon> {
    const hackathon = await this.findOne(id);

    // Check if user is the organizer (if organizerId is provided)
    if (organizerId && hackathon.organizerId !== organizerId) {
      throw new ForbiddenException('You can only publish hackathons you organize');
    }

    if (hackathon.status !== HackathonStatus.DRAFT) {
      throw new BadRequestException('Only draft hackathons can be published');
    }

    await this.hackathonRepository.update(id, { status: HackathonStatus.PUBLISHED });
    return this.findOne(id);
  }

  async activate(id: string, organizerId?: string): Promise<Hackathon> {
    const hackathon = await this.findOne(id);

    // Check if user is the organizer (if organizerId is provided)
    if (organizerId && hackathon.organizerId !== organizerId) {
      throw new ForbiddenException('You can only activate hackathons you organize');
    }

    if (hackathon.status !== HackathonStatus.PUBLISHED) {
      throw new BadRequestException('Only published hackathons can be activated');
    }

    await this.hackathonRepository.update(id, { status: HackathonStatus.ACTIVE });
    return this.findOne(id);
  }

  async complete(id: string, organizerId?: string): Promise<Hackathon> {
    const hackathon = await this.findOne(id);

    // Check if user is the organizer (if organizerId is provided)
    if (organizerId && hackathon.organizerId !== organizerId) {
      throw new ForbiddenException('You can only complete hackathons you organize');
    }

    if (hackathon.status !== HackathonStatus.ACTIVE) {
      throw new BadRequestException('Only active hackathons can be completed');
    }

    await this.hackathonRepository.update(id, { status: HackathonStatus.COMPLETED });
    return this.findOne(id);
  }

  async getPublicHackathons(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ hackathons: Hackathon[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.hackathonRepository.createQueryBuilder('hackathon');

    queryBuilder
      .where('hackathon.status IN (:...statuses)', {
        statuses: [HackathonStatus.PUBLISHED, HackathonStatus.ACTIVE],
      })
      // Use createdAt; entity doesn't define startDate
      .orderBy('hackathon.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [hackathons, total] = await queryBuilder.getManyAndCount();

    return {
      hackathons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getHackathonStats(id: string): Promise<any> {
    const hackathon = await this.findOne(id);

    const stats = {
      totalTeams: hackathon.teams?.length || 0,
      totalSubmissions: hackathon.submissions?.length || 0,
      totalParticipants: 0,
      submissionRate: 0,
    };

    // Calculate submission rate
    if (stats.totalTeams > 0) {
      stats.submissionRate = (stats.totalSubmissions / stats.totalTeams) * 100;
    }

    return stats;
  }
}