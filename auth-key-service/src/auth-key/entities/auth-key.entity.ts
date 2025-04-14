import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('auth-key')
export class AuthKey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;  // User who owns the key

    @Column()
    key: string;  // Generated key

    @Column('int')
    rateLimit: number;  // Rate limit in requests per minute

    @Column('timestamp')
    expiration: Date;  // Expiration date of the key

    @Column({ default: true })
    isActive: boolean;  // Whether the key is active or disabled
}
