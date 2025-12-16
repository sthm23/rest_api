import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({
    name: 'tokens',
})
export class Token {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: number;

    @Column()
    refreshTokenHash: string;

    @Column({ default: false })
    isRevoked: boolean;

    @Column()
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
