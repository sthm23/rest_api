import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({
    name: 'files',
})
export class File {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: number;

    @Column()
    original_name: string;

    @Column()
    extension: string;

    @Column()
    mime_type: string;

    @Column()
    size: string;

    @Column()
    path: string;

    @CreateDateColumn()
    created_at: Date;
}