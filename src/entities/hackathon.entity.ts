import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

export enum HackathonMode {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  HYBRID = 'Hybrid',
}

export enum HackathonStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('hackathons')
export class Hackathon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizer_id', type: 'uuid' })
  organizerId: string;

  @Column({ length: 500 })
  title: string;

  @Column({ name: 'problem_statement', type: 'text' })
  problemStatement: string;

  @Column({
    type: 'enum',
    enum: HackathonMode,
  })
  mode: HackathonMode;

  @Column({ name: 'banner_url', length: 500, nullable: true })
  bannerUrl: string;

  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'jsonb' })
  timeline: object;

  @Column({ name: 'participation_rules', type: 'jsonb' })
  participationRules: object;

  @Column({ name: 'submission_requirements', type: 'jsonb' })
  submissionRequirements: object;

  @Column({ name: 'communication_resources', type: 'jsonb' })
  communicationResources: object;

  @Column({ name: 'prize_rewards', type: 'jsonb' })
  prizeRewards: object;

  @Column({ type: 'jsonb' })
  settings: object;

  @Column({
    type: 'enum',
    enum: HackathonStatus,
    default: HackathonStatus.DRAFT,
  })
  status: HackathonStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations will be added as we create other entities
  @ManyToOne('Admin', 'hackathons', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organizer_id' })
  organizer: any;

  @OneToMany('Team', 'hackathon')
  teams: any[];

  @OneToMany('Submission', 'hackathon')
  submissions: any[];

  @OneToMany('Announcement', 'hackathon')
  announcements: any[];

  @OneToMany('ActivityLog', 'hackathon')
  activityLogs: any[];

  @OneToMany('AnalyticsData', 'hackathon')
  analyticsData: any[];

  @OneToMany('ReportsExport', 'hackathon')
  reportsExports: any[];

  @OneToMany('Registration', 'hackathon')
  registrations: any[];

  @OneToMany('Payment', 'hackathon')
  payments: any[];

  @OneToMany('Event', 'hackathon')
  events: any[];

  @OneToMany('Result', 'hackathon')
  results: any[];
}