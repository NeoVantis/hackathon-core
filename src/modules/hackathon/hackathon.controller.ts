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
import { HackathonService } from './hackathon.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import { AdminAuthGuard } from '../../common/guards/auth.guard';
import { CurrentAdmin } from '../../common/decorators/auth.decorator';
import { HackathonStatus } from '../../entities/hackathon.entity';

@Controller('hackathons')
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @Post()
  @UseGuards(AdminAuthGuard)
  async create(
    @Body() createHackathonDto: CreateHackathonDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.hackathonService.create(createHackathonDto, admin.id);
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  async findAll(
    @CurrentAdmin() admin: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: HackathonStatus,
  ) {
    return this.hackathonService.findAll(
      parseInt(page),
      parseInt(limit),
      status,
      admin.id,
    );
  }

  @Get('public')
  async getPublicHackathons(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.hackathonService.getPublicHackathons(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hackathonService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.hackathonService.findBySlug(slug);
  }

  @Get(':id/stats')
  @UseGuards(AdminAuthGuard)
  async getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.hackathonService.getHackathonStats(id);
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHackathonDto: UpdateHackathonDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.hackathonService.update(id, updateHackathonDto, admin.id);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentAdmin() admin: any,
  ) {
    return this.hackathonService.remove(id, admin.id);
  }

  @Post(':id/publish')
  @UseGuards(AdminAuthGuard)
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentAdmin() admin: any,
  ) {
    return this.hackathonService.publish(id, admin.id);
  }

  @Post(':id/activate')
  @UseGuards(AdminAuthGuard)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentAdmin() admin: any,
  ) {
    return this.hackathonService.activate(id, admin.id);
  }

  @Post(':id/complete')
  @UseGuards(AdminAuthGuard)
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentAdmin() admin: any,
  ) {
    return this.hackathonService.complete(id, admin.id);
  }
}