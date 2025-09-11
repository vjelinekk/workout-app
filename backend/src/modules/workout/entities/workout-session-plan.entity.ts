import { BaseEntity } from 'src/common/entities/base.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { WorkoutSessionPlanExerciseEntity } from './workout-session-plan-exercise.entity';
import { TrainingSplitDayEntity } from 'src/modules/training-split/entities/training-split-day.entity';
import { WorkoutSessionEntity } from './workout-session.entity';

@Entity('workout_session_plan')
export class WorkoutSessionPlanEntity extends BaseEntity {
    @Column({ comment: 'Name of the workout session plan' })
    name: string;

    @Column({
        type: 'text',
        nullable: true,
        comment: 'Description of the workout session plan',
    })
    description: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'created_by' })
    createdBy: UserEntity;

    @Column({
        name: 'is_public',
        default: false,
        comment: 'Indicates if the workout session plan is public',
    })
    isPublic: boolean;

    @Column({
        name: 'is_approved',
        default: false,
        comment:
            'Indicates if the workout session plan is approved by an admin',
    })
    isApproved: boolean;

    @OneToMany(
        () => WorkoutSessionPlanExerciseEntity,
        (wspe) => wspe.workoutSessionPlan,
    )
    exercises: WorkoutSessionPlanExerciseEntity[];

    @OneToMany(() => TrainingSplitDayEntity, (tsd) => tsd.workoutSessionPlan)
    trainingSplitDays: TrainingSplitDayEntity[];

    @OneToMany(
        () => WorkoutSessionEntity,
        (session) => session.workoutSessionPlan,
    )
    workoutSessions: WorkoutSessionEntity[];
}
