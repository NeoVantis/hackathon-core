import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ length: 255, nullable: true })
  college: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'registration_step', default: 0 })
  registrationStep: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany('TeamMember', 'user')
  teamMemberships: any[];

  @OneToMany('Registration', 'user')
  registrations: any[];

  @OneToMany('Payment', 'user')
  payments: any[];

  @OneToMany('EventAttendee', 'user')
  eventAttendances: any[];

  @OneToMany('Notification', 'user')
  notifications: any[];
}