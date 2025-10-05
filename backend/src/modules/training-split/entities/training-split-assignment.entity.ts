import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TrainingSplitEntity } from './training-split.entity';
import { TrainingSplitAssignmentStatusEnum } from '../enums/training-split-assignment-status.enum';
import { BaseEntity } from 'src/common/entities/base.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity('training_split_assignment')
export class TrainingSplitAssignmentEntity extends AuditableEntity {
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'trainee_id' })
    trainee: UserEntity;

    @ManyToOne(() => TrainingSplitEntity, (split) => split.assignments)
    @JoinColumn({ name: 'training_split_id' })
    trainingSplit: TrainingSplitEntity;

    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: 'assigned_by' })
    assignedBy?: UserEntity; // null = self-assigned

    @Column({ type: 'enum', enum: TrainingSplitAssignmentStatusEnum })
    status: TrainingSplitAssignmentStatusEnum;

    @Column({
        name: 'assigned_at',
        type: 'timestamp',
        comment: 'Timestamp when the training split was assigned',
    })
    assignedAt: Date;

    @Column({
        name: 'responded_at',
        type: 'timestamp',
        nullable: true,
        comment:
            'Timestamp when the trainee responded to the assignment (accepted/declined)',
    })
    respondedAt?: Date;
}
