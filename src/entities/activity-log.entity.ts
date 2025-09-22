import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hackathon_id', type: 'uuid' })
  hackathonId: string;

  @Column({ name: 'admin_id', type: 'uuid' })
  adminId: string;

  @Column({ length: 100 })
  action: string;

  @Column({ name: 'entity_type', length: 50, nullable: true })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  details: object;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  // Relations
  @ManyToOne('Hackathon', 'activityLogs', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackathon_id' })
  hackathon: any;

  @ManyToOne('Admin', 'activityLogs')
  @JoinColumn({ name: 'admin_id' })
  admin: any;
}