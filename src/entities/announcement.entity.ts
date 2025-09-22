import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum AnnouncementType {
  NEW = 'new',
  INFO = 'info',
  UPDATE = 'update',
  IMPORTANT = 'important',
}

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hackathon_id', type: 'uuid' })
  hackathonId: string;

  @Column({
    type: 'enum',
    enum: AnnouncementType,
    default: AnnouncementType.INFO,
  })
  type: AnnouncementType;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne('Hackathon', 'announcements', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackathon_id' })
  hackathon: any;

  @ManyToOne('Admin', 'announcements')
  @JoinColumn({ name: 'created_by' })
  admin: any;
}