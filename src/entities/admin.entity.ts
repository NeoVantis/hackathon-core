import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum AdminRole {
  SUPER_ADMIN = 0,
  ADMIN = 1,
}

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({
    type: 'int',
    enum: AdminRole,
    enumName: 'admin_role',
  })
  role: AdminRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany('Hackathon', 'organizer')
  hackathons: any[];

  @OneToMany('ActivityLog', 'admin')
  activityLogs: any[];

  @OneToMany('ReportsExport', 'admin')
  reportsExports: any[];

  @OneToMany('FileUpload', 'admin')
  fileUploads: any[];

  @OneToMany('Announcement', 'admin')
  announcements: any[];

  @OneToMany('Event', 'admin')
  events: any[];

  @OneToMany('Result', 'admin')
  results: any[];
}