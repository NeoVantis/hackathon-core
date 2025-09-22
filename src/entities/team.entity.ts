import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

export enum TeamStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  CHECKED_IN = 'checked_in',
  DISQUALIFIED = 'disqualified',
}

export enum SubmissionStatus {
  NOT_SUBMITTED = 'not_submitted',
  SUBMITTED = 'submitted',
  LATE = 'late',
}

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hackathon_id', type: 'uuid' })
  hackathonId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TeamStatus,
    default: TeamStatus.PENDING,
  })
  status: TeamStatus;

  @Column({
    name: 'submission_status',
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.NOT_SUBMITTED,
  })
  submissionStatus: SubmissionStatus;

  @Column({ name: 'ai_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiScore: number;

  @Column({ length: 100, nullable: true })
  eligibility: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne('Hackathon', 'teams', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackathon_id' })
  hackathon: any;

  @OneToMany('TeamMember', 'team')
  members: any[];

  @OneToOne('Submission', 'team')
  submission: any;

  @OneToMany('Result', 'team')
  results: any[];
}