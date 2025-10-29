import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { TrainerTraineeStatusEnum } from '../enums/trainer-trainee-status.enum';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('trainer_trainee')
export class TrainerTraineeEntity extends BaseEntity {
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'trainer_id' })
    trainer: UserEntity;

    @Column({ name: 'trainer_id' })
    trainerId: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'trainee_id' })
    trainee: UserEntity;

    @Column({ name: 'trainee_id' })
    traineeId: number;

    @Column({
        type: 'enum',
        enum: TrainerTraineeStatusEnum,
        default: TrainerTraineeStatusEnum.PENDING,
        comment: 'Status of the trainer-trainee relationship',
    })
    status: TrainerTraineeStatusEnum;

    @Column({
        name: 'assigned_at',
        type: 'timestamp',
        comment: 'Timestamp when the trainer was assigned to the trainee',
    })
    assignedAt: Date;
}
