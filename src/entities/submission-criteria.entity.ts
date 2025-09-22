import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

export enum CriterionType {
  INNOVATION = 'innovation',
  FEASIBILITY = 'feasibility',
  DESIGN = 'design',
  IMPACT = 'impact',
}

@Entity('submission_criteria')
@Unique(['submissionId', 'criterion'])
export class SubmissionCriteria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'submission_id', type: 'uuid' })
  submissionId: string;

  @Column({
    type: 'enum',
    enum: CriterionType,
  })
  criterion: CriterionType;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  // Relations
  @ManyToOne('Submission', 'criteria', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission: any;
}