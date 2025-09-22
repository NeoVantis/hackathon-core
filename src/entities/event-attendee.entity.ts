import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

export enum AttendeeRegistrationType {
  REGISTERED = 'registered',
  WAITLIST = 'waitlist',
  CANCELLED = 'cancelled',
}

@Entity('event_attendees')
@Unique(['eventId', 'userId'])
export class EventAttendee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'registration_type', type: 'enum', enum: AttendeeRegistrationType, default: AttendeeRegistrationType.REGISTERED })
  registrationType: AttendeeRegistrationType;

  @Column({ default: false })
  attended: boolean;

  @Column({ name: 'check_in_time', type: 'timestamp', nullable: true })
  checkInTime: Date;

  @Column({ name: 'feedback_rating', type: 'int', nullable: true })
  feedbackRating: number;

  @Column({ name: 'feedback_comments', type: 'text', nullable: true })
  feedbackComments: string;

  @ManyToOne('Event', 'attendees', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: any;

  @ManyToOne('User', 'eventAttendances', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;
}