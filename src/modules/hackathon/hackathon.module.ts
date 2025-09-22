import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HackathonService } from './hackathon.service';
import { HackathonController } from './hackathon.controller';
import { Hackathon } from '../../entities/hackathon.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hackathon]),
    AuthModule,
  ],
  controllers: [HackathonController],
  providers: [HackathonService],
  exports: [HackathonService],
})
export class HackathonModule {}