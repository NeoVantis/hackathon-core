import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export enum EventType {
  WORKSHOP = 'workshop',
  KEYNOTE = 'keynote',
  SESSION = 'session',
  NETWORKING = 'networking',
  CEREMONY = 'ceremony',
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hackathon_id', type: 'uuid' })
  hackathonId: string;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: EventType })
  type: EventType;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ name: 'is_mandatory', default: false })
  isMandatory: boolean;

  @Column({ name: 'speaker_id', type: 'uuid', nullable: true })
  speakerId: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  resources: object[];

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.SCHEDULED })
  status: EventStatus;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Hackathon', 'events', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackathon_id' })
  hackathon: any;

  @ManyToOne('User', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'speaker_id' })
  speaker: any;

  @ManyToOne('Admin', 'events')
  @JoinColumn({ name: 'created_by' })
  admin: any;

  @OneToMany('EventAttendee', 'event')
  attendees: any[];
}