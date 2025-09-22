import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('results')
export class Result {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hackathon_id', type: 'uuid' })
  hackathonId: string;

  @Column({ name: 'submission_id', type: 'uuid' })
  submissionId: string;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @Column({ type: 'int' })
  rank: number;

  @Column({ name: 'award_type', length: 100 })
  awardType: string;

  @Column({ name: 'award_title', length: 255 })
  awardTitle: string;

  @Column({ name: 'award_description', type: 'text', nullable: true })
  awardDescription: string;

  @Column({ name: 'prize_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  prizeAmount: number;

  @Column({ name: 'prize_description', type: 'text', nullable: true })
  prizeDescription: string;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('Hackathon', 'results', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackathon_id' })
  hackathon: any;

  @ManyToOne('Submission', 'results', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission: any;

  @ManyToOne('Team', 'results', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: any;

  @ManyToOne('Admin', 'results')
  @JoinColumn({ name: 'created_by' })
  admin: any;
}