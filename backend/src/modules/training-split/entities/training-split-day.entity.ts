import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TrainingSplitEntity } from './training-split.entity';
import { WorkoutSessionPlanEntity } from 'src/modules/workout/entities/workout-session-plan.entity';

@Entity('training_split_day')
export class TrainingSplitDayEntity extends BaseEntity {
    @ManyToOne(() => TrainingSplitEntity, (split) => split.days)
    @JoinColumn({ name: 'training_split_id' })
    trainingSplit: TrainingSplitEntity;

    @ManyToOne(() => WorkoutSessionPlanEntity, (plan) => plan.trainingSplitDays)
    @JoinColumn({ name: 'workout_session_plan_id' })
    workoutSessionPlan: WorkoutSessionPlanEntity;

    @Column({
        name: 'day_of_week',
        type: 'int',
        comment:
            'Day of the week for this training split day (1=Monday, 7=Sunday)',
    })
    dayOfWeek: number; // 1=Monday, 7=Sunday

    @Column({
        nullable: true,
        comment:
            'Order of the workout session plan in the day, if multiple plans are assigned to the same day',
    })
    order: number; // optional if multiple plans per day
}
