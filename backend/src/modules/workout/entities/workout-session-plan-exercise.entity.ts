import { ExerciseEntity } from 'src/modules/exercise/entities/exercise.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { WorkoutSessionPlanEntity } from './workout-session-plan.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity('workout_session_plan_exercise')
export class WorkoutSessionPlanExerciseEntity extends AuditableEntity {
    @ManyToOne(() => WorkoutSessionPlanEntity, (plan) => plan.exercises)
    @JoinColumn({ name: 'workout_session_plan_id' })
    workoutSessionPlan: WorkoutSessionPlanEntity;

    @Column({ name: 'workout_session_plan_id' })
    workoutSessionPlanId: number;

    @ManyToOne(() => ExerciseEntity)
    @JoinColumn({ name: 'exercise_id' })
    exercise: ExerciseEntity;

    @Column({ name: 'exercise_id' })
    exerciseId: number;

    @Column({ comment: 'Order of the exercise in the workout session plan' })
    order: number;

    @Column({
        name: 'planned_sets',
        comment: 'Number of sets planned for the exercise',
    })
    plannedSets: number;

    @Column({
        type: 'json',
        name: 'planned_reps_per_set',
        comment: 'Number of reps planned for each set',
    })
    plannedRepsPerSet: number[];
}
