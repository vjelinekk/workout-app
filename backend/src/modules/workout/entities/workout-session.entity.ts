import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { WorkoutSessionPlanEntity } from './workout-session-plan.entity';
import { TrainingSplitEntity } from 'src/modules/training-split/entities/training-split.entity';
import { WorkoutSessionStatusEnum } from '../enums/workout-session-status.enum';
import { WorkoutSessionExerciseEntity } from './workout-session-exercise.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity('workout_session')
export class WorkoutSessionEntity extends AuditableEntity {
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'performed_by_id' })
    performedBy: UserEntity;

    @Column({ name: 'performed_by_id', nullable: true })
    performedById: number;

    @ManyToOne(() => WorkoutSessionPlanEntity, (plan) => plan.workoutSessions)
    @JoinColumn({ name: 'workout_session_plan_id' })
    workoutSessionPlan: WorkoutSessionPlanEntity;

    @Column({ name: 'workout_session_plan_id' })
    workoutSessionPlanId: number;

    @ManyToOne(() => TrainingSplitEntity, (split) => split.workoutSessions, {
        nullable: true,
    })
    @JoinColumn({ name: 'training_split_id' })
    trainingSplit?: TrainingSplitEntity;

    @Column({ name: 'training_split_id', nullable: true })
    trainingSplitId?: number;

    @Column({
        type: 'enum',
        enum: WorkoutSessionStatusEnum,
        default: WorkoutSessionStatusEnum.IN_PROGRESS,
        comment: 'Status of the workout session',
    })
    status: WorkoutSessionStatusEnum;

    @Column({
        name: 'started_at',
        type: 'timestamp',
        nullable: true,
        comment: 'Timestamp when the workout session was started',
    })
    startedAt?: Date;

    @Column({
        name: 'finished_at',
        type: 'timestamp',
        nullable: true,
        comment: 'Timestamp when the workout session was finished',
    })
    finishedAt?: Date;

    @Column({
        type: 'text',
        nullable: true,
        comment: 'Notes about the workout session',
    })
    notes?: string;

    @Column({
        name: 'duration_seconds',
        nullable: true,
        comment: 'Duration of the workout session in seconds',
    })
    durationSeconds?: number;

    @OneToMany(() => WorkoutSessionExerciseEntity, (wse) => wse.workoutSession)
    exercises: WorkoutSessionExerciseEntity[];
}
