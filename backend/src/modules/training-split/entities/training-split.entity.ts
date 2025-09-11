import { BaseEntity } from 'src/common/entities/base.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TrainingSplitDayEntity } from './training-split-day.entity';
import { TrainingSplitAssignmentEntity } from './training-split-assignment.entity';
import { WorkoutSessionEntity } from 'src/modules/workout/entities/workout-session.entity';

@Entity('training_split')
export class TrainingSplitEntity extends BaseEntity {
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'created_by' })
    createdBy: UserEntity;

    @Column({
        type: 'text',
        nullable: false,
        comment: 'Name of the training split',
    })
    name: string;

    @Column({
        type: 'text',
        nullable: true,
        comment: 'Description of the training split',
    })
    description: string;

    @Column({
        name: 'is_public',
        default: false,
        comment: 'Whether the training split is public',
    })
    isPublic: boolean;

    @Column({
        name: 'is_approved',
        default: false,
        comment: 'Whether the training split is approved',
    })
    isApproved: boolean;

    @OneToMany(() => TrainingSplitDayEntity, (tsd) => tsd.trainingSplit)
    days: TrainingSplitDayEntity[];

    @OneToMany(() => TrainingSplitAssignmentEntity, (tsa) => tsa.trainingSplit)
    assignments: TrainingSplitAssignmentEntity[];

    @OneToMany(() => WorkoutSessionEntity, (session) => session.trainingSplit)
    workoutSessions: WorkoutSessionEntity[];
}
