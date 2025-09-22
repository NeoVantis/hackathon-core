import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('analytics_data')
export class AnalyticsData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hackathon_id', type: 'uuid' })
  hackathonId: string;

  @Column({ name: 'metric_type', length: 50 })
  metricType: string;

  @Column({ type: 'jsonb' })
  data: object;

  @CreateDateColumn({ name: 'computed_at' })
  computedAt: Date;

  @ManyToOne('Hackathon', 'analyticsData', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackathon_id' })
  hackathon: any;
}