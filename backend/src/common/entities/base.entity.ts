import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        comment: 'Timestamp when the entry was created',
    })
    createdAt: Date;

    @Column({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
        comment: 'Timestamp when the entry was last updated',
    })
    updatedAt: Date;

    @Column({
        name: 'is_deleted',
        default: false,
        comment: 'Indicates if the entry is deleted',
    })
    isDeleted: boolean;
}
