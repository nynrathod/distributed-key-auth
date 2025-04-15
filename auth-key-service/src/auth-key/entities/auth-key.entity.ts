import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('auth-key')
export class AuthKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ unique: true })
  accessKey: string;

  @Column('int')
  rateLimit: number;

  @Column('bigint')
  expiration: number;

  @Column({ default: true })
  isActive: boolean;
}
