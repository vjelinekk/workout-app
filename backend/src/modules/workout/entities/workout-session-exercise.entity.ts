import { ExerciseEntity } from 'src/modules/exercise/entities/exercise.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { WorkoutSessionEntity } from './workout-session.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity('workout_session_exercise')
export class WorkoutSessionExerciseEntity extends AuditableEntity {
    @ManyToOne(() => WorkoutSessionEntity, (session) => session.exercises)
    @JoinColumn({ name: 'workout_session_id' })
    workoutSession: WorkoutSessionEntity;

    @Column({ name: 'workout_session_id' })
    workoutSessionId: number;

    @ManyToOne(() => ExerciseEntity)
    @JoinColumn({ name: 'exercise_id' })
    exercise: ExerciseEntity;

    @Column({ name: 'exercise_id' })
    exerciseId: number;

    @Column({ comment: 'Order of the exercise in the workout session' })
    order: number;

    @Column({
        name: 'actual_reps_per_set',
        type: 'json',
        comment: 'Actual reps performed per set',
    })
    actualRepsPerSet: (number | null)[];

    @Column({
        name: 'actual_weight_per_set',
        type: 'json',
        comment: 'Actual weight lifted per set',
    })
    actualWeightPerSet: (number | null)[];

    @Column({ type: 'text', nullable: true })
    notes?: string;
}
