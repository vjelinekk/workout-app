import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export class AuditableEntity extends BaseEntity {
    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: UserEntity;

    @Column({ name: 'created_by_id', comment: 'User who created the entry' })
    createdById: number;

    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: 'updated_by_id' })
    updatedBy?: UserEntity;

    @Column({
        name: 'updated_by_id',
        nullable: true,
        comment: 'User who updated the entry',
    })
    updatedById: number | null;

    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: 'deleted_by_id' })
    deletedBy?: UserEntity;

    @Column({
        name: 'deleted_by_id',
        nullable: true,
        comment: 'User who deleted the entry',
    })
    deletedById: number | null;
}
