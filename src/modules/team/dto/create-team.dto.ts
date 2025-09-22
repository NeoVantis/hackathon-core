import { IsString, IsOptional, IsUUID, IsArray, IsEnum } from 'class-validator';
import { TeamStatus } from '../../../entities/team.entity';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  hackathonId: string;

  @IsEnum(TeamStatus)
  @IsOptional()
  status?: TeamStatus;
}