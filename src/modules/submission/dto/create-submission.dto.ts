import { IsString, IsOptional, IsUUID, IsUrl, IsObject, IsEnum } from 'class-validator';
import { SubmissionStatus } from '../../../entities/submission.entity';

export class CreateSubmissionDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  hackathonId: string;

  @IsUUID()
  teamId: string;

  @IsUrl()
  @IsOptional()
  githubUrl?: string;

  @IsUrl()
  @IsOptional()
  demoUrl?: string;

  @IsUrl()
  @IsOptional()
  pptUrl?: string;

  @IsObject()
  @IsOptional()
  otherLinks?: object[];

  @IsEnum(SubmissionStatus)
  @IsOptional()
  status?: SubmissionStatus;
}