export interface WorkoutSessionPlan {
    id: number;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
    name: string;
    description: string;
    created_by: number;
    is_public: boolean;
    is_approved: boolean;
    exercises?: WorkoutSessionPlanExercise[];
}

export interface WorkoutSessionPlanExercise {
    id: number;
    workout_session_plan_id: number;
    exercise_id: number;
    order: number;
    planned_sets: number;
    planned_reps_per_set: number[];
}