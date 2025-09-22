import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { AdminAuthGuard } from '../../common/guards/auth.guard';
import { SubmissionStatus } from '../../entities/submission.entity';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async create(@Body() createSubmissionDto: CreateSubmissionDto) {
    return this.submissionService.create(createSubmissionDto);
  }

  @Get()
  async findAll(
    @Query('hackathonId') hackathonId?: string,
    @Query('teamId') teamId?: string,
    @Query('status') status?: SubmissionStatus,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.submissionService.findAll(
      hackathonId,
      teamId,
      status,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('hackathon/:hackathonId')
  async getSubmissionsByHackathon(
    @Param('hackathonId', ParseUUIDPipe) hackathonId: string,
  ) {
    return this.submissionService.getSubmissionsByHackathon(hackathonId);
  }

  @Get('team/:teamId')
  async getSubmissionsByTeam(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.submissionService.getSubmissionsByTeam(teamId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.submissionService.findOne(id);
  }

  @Get(':id/stats')
  @UseGuards(AdminAuthGuard)
  async getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.submissionService.getSubmissionStats(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
  ) {
    return this.submissionService.update(id, updateSubmissionDto);
  }

  @Patch(':id/status')
  @UseGuards(AdminAuthGuard)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: SubmissionStatus,
  ) {
    return this.submissionService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.submissionService.remove(id);
  }
}