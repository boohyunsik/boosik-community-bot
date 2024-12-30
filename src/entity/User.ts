import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity({ name: 'user' })
@Unique(['telegramId'])
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    telegramId!: number;

    @Column({ nullable: true })
    username?: string;

    @Column()
    address!: string;
}