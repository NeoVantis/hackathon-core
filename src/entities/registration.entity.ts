import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum RegistrationType {
  PARTICIPANT = 'participant',
  MENTOR = 'mentor',
  JUDGE = 'judge',
  VOLUNTEER = 'volunteer',
}

export enum RegistrationStatus {
  REGISTERED = 'registered',
  CONFIRMED = 'confirmed',
  WAITLISTED = 'waitlisted',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  NOT_REQUIRED = 'not_required',
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'hackathon_id', type: 'uuid' })
  hackathonId: string;

  @Column({
    name: 'registration_type',
    type: 'enum',
    enum: RegistrationType,
    default: RegistrationType.PARTICIPANT,
  })
  registrationType: RegistrationType;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.REGISTERED,
  })
  status: RegistrationStatus;

  @Column({ name: 'registration_data', type: 'jsonb', default: () => "'{}'" })
  registrationData: object;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.NOT_REQUIRED,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'payment_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  paymentAmount: number;

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date;

  // Relations
  @ManyToOne('User', 'registrations', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Hackathon', 'registrations', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackathon_id' })
  hackathon: any;
}