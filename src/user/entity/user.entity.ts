
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({
    name: 'users',
})
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    login: string;

    @Column()
    password: string;

    @Column({ type: "boolean", default: true })
    isActive: boolean;

    @CreateDateColumn()
    created_at: Date;
}
