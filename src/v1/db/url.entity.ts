import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class V1Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  longUrl: string;

  @Column({ unique: true })
  @Index()
  shortUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime' })
  expiresAt: Date;
}
