import { api } from "../axios";
import { Scope } from "@/types/scope";
import { ApiError, handleApiError } from "@/utils/apiError";
import { WorkoutSessionPlan, WorkoutSessionPlanExercise } from "@/types/workoutSessionPlan";
import { WORKOUT_SESSION_PLAN_ENDPOINTS, WORKOUT_SESSION_PLAN_EXERCISES_ENDPOINTS } from "../endpoints/workoutSessionPlan";
import { WorkoutSessionPlanFormValues } from "@/schemas/workoutSessionPlan";

export const QUERY_KEY_WORKOUT_SESSION_PLANS = 'workout-session-plans';
export const fetchAllWorkoutSessionPlans = async (
    scope: Scope = Scope.ALL,
    signal?: AbortSignal
) => {
    const data = await api.get<WorkoutSessionPlan[]>(WORKOUT_SESSION_PLAN_ENDPOINTS.workoutSessionPlans, {
        params: { scope },
        signal,
    });

    return data.data;
}

export const QUERY_KEY_WORKOUT_SESSION_PLAN = 'workout-session-plan';
export const fetchWorkoutSessionPlanById = async (id: number, signal?: AbortSignal): Promise<WorkoutSessionPlan> => {
    const { data } = await api.get<WorkoutSessionPlan>(`${WORKOUT_SESSION_PLAN_ENDPOINTS.workoutSessionPlans}/${id}`, { signal });

    const workoutSessionPlanId = data.id;
    
    const { data: exercisesData } = await api.get<WorkoutSessionPlanExercise[]>(`${WORKOUT_SESSION_PLAN_EXERCISES_ENDPOINTS.workoutSessionPlanExercises}`, {
        params: { workout_session_plan_id: workoutSessionPlanId },
        signal,
    });

    const result: WorkoutSessionPlan = {
        ...data,
        exercises: exercisesData,
    }

    return result;
}

const mapWorkoutSessionPlanToApiFormat = (workoutSessionPlan: WorkoutSessionPlanFormValues): {
    name: string;
    description: string;
    is_public: boolean;
    is_approved: boolean;
} => {
    return {
        name: workoutSessionPlan.name,
        description: workoutSessionPlan.description,
        is_public: workoutSessionPlan.is_public,
        is_approved: workoutSessionPlan.is_approved,
    }
}

const mapWorkoutSessionPlanExerciseToApiFormat = (exercise: {
    id?: number;
    exercise_id: number | undefined;
    sets: { reps: number }[];
}, workoutSessionPlanId: number, order: number): {
    workout_session_plan_id: number;
    exercise_id: number;
    order: number;
    planned_sets: number;
    planned_reps_per_set: number[];
} => {
    if (!exercise.exercise_id) {
        throw new ApiError('Exercise ID is required for each exercise');
    }

    return {
        workout_session_plan_id: workoutSessionPlanId,
        exercise_id: exercise.exercise_id,
        order,
        planned_sets: exercise.sets.length,
        planned_reps_per_set: exercise.sets.map(set => set.reps),
    }
}

const mapWorkoutSessionPlanExercisesToApiFormat = (exercises: {
    id?: number;
    exercise_id: number | undefined;
    sets: { reps: number }[];
}[], workoutSessionPlanId: number): {
    workout_session_plan_id: number;
    exercise_id: number;
    order: number;
    planned_sets: number;
    planned_reps_per_set: number[];
}[] => {
    return exercises.map((exercise, index) => 
        mapWorkoutSessionPlanExerciseToApiFormat(exercise, workoutSessionPlanId, index + 1)
    );
}

export const createWorkoutSessionPlan = async (workoutSessionPlan: WorkoutSessionPlanFormValues): Promise<WorkoutSessionPlan> => {
    try {
        const workoutSessionPlanData = mapWorkoutSessionPlanToApiFormat(workoutSessionPlan);

        const { data } = await api.post<WorkoutSessionPlan>(`${WORKOUT_SESSION_PLAN_ENDPOINTS.workoutSessionPlans}`, workoutSessionPlanData);

        const workoutSessionPlanId = data.id;
        const workoutSessionPlanExercises = mapWorkoutSessionPlanExercisesToApiFormat(workoutSessionPlan.exercises, workoutSessionPlanId);
        await api.post(`${WORKOUT_SESSION_PLAN_EXERCISES_ENDPOINTS.bulk}`, workoutSessionPlanExercises);
        
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to create workout session plan');
    }
}

export const updateWorkoutSessionPlan = async (id: number, workoutSessionPlan: WorkoutSessionPlanFormValues): Promise<WorkoutSessionPlan> => {
    try {
        const workoutSessionPlanData = mapWorkoutSessionPlanToApiFormat(workoutSessionPlan);
        const { data } = await api.patch<WorkoutSessionPlan>(`${WORKOUT_SESSION_PLAN_ENDPOINTS.workoutSessionPlans}/${id}`, workoutSessionPlanData);

        const workoutSessionPlanId = data.id;
        const workoutSessionPlanExercises = mapWorkoutSessionPlanExercisesToApiFormat(workoutSessionPlan.exercises, workoutSessionPlanId);
        await api.put(`${WORKOUT_SESSION_PLAN_EXERCISES_ENDPOINTS.bulk}`, workoutSessionPlanExercises, {
            params: {
                workoutSessionPlanId
            }
        });

        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to update workout session plan');
    }
}

export const deleteWorkoutSessionPlan = async (id: number): Promise<WorkoutSessionPlan> => {
    try {
        const { data } = await api.delete(`${WORKOUT_SESSION_PLAN_ENDPOINTS.workoutSessionPlans}/${id}`);
        return data;
    } catch (error: unknown) {
        handleApiError(error, 'Failed to delete workout session plan');
    }
}