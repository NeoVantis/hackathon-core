import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('reports_exports')
export class ReportsExport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hackathon_id', type: 'uuid' })
  hackathonId: string;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 20 })
  format: string;

  @Column({ name: 'file_url', length: 500, nullable: true })
  fileUrl: string;

  @Column({ name: 'generated_by', type: 'uuid' })
  generatedBy: string;

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt: Date;

  @ManyToOne('Hackathon', 'reportsExports', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hackathon_id' })
  hackathon: any;

  @ManyToOne('Admin', 'reportsExports')
  @JoinColumn({ name: 'generated_by' })
  admin: any;
}