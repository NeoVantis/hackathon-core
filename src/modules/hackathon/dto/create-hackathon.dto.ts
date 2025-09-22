import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { HackathonStatus, HackathonMode } from '../../../entities/hackathon.entity';

export class CreateHackathonDto {
  @IsString()
  title: string;

  @IsString()
  problemStatement: string;

  @IsEnum(HackathonMode)
  mode: HackathonMode;

  @IsEnum(HackathonStatus)
  @IsOptional()
  status?: HackathonStatus = HackathonStatus.DRAFT;

  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsObject()
  timeline: object;

  @IsObject()
  participationRules: object;

  @IsObject()
  submissionRequirements: object;

  @IsObject()
  communicationResources: object;

  @IsObject()
  prizeRewards: object;

  @IsObject()
  @IsOptional()
  settings?: object;
}