import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

export enum TeamMemberRole {
  LEADER = 'leader',
  MEMBER = 'member',
}

@Entity('team_members')
@Unique(['teamId', 'userId'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: TeamMemberRole,
    default: TeamMemberRole.MEMBER,
  })
  role: TeamMemberRole;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  // Relations
  @ManyToOne('Team', 'members', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: any;

  @ManyToOne('User', 'teamMemberships', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;
}