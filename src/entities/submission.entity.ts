import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

export enum SubmissionStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  FLAGGED = 'flagged',
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id', type: 'uuid', unique: true })
  teamId: string;

  @Column({ name: 'hackathon_id', type: 'uuid' })
  hackathonId: string;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'github_url', length: 500, nullable: true })
  githubUrl: string;

  @Column({ name: 'demo_url', length: 500, nullable: true })
  demoUrl: string;

  @Column({ name: 'ppt_url', length: 500, nullable: true })
  pptUrl: string;

  @Column({ name: 'other_links', type: 'jsonb', default: () => "'[]'" })
  otherLinks: object[];

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ name: 'ai_overall_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiOverallScore: number;

  @Column({ name: 'ai_confidence', type: 'decimal', precision: 3, scale: 2, nullable: true })
  aiConfidence: number;

  @Column({ name: 'ai_feedback', type: 'text', nullable: true })
  aiFeedback: string;

  @Column({ name: 'manual_score_override', type: 'decimal', precision: 5, scale: 2, nullable: true })
  manualScoreOverride: number;

  @Column({ name: 'manual_notes', type: 'text', nullable: true })
  manualNotes: string;

  @Column({ name: 'judge_id', type: 'uuid', nullable: true })
  judgeId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne('Team', 'submission', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: any;

  @ManyToOne('Hackathon', 'submissions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackathon_id' })
  hackathon: any;

  @ManyToOne('Admin', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'judge_id' })
  judge: any;

  @OneToMany('SubmissionCriteria', 'submission')
  criteria: any[];

  @OneToMany('Result', 'submission')
  results: any[];
}