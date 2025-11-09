import { api } from "../axios";
import { Scope } from "@/types/scope";
import { ApiError } from "@/utils/apiError";
import { WorkoutSessionPlan, WorkoutSessionPlanExercise } from "@/types/workoutSessionPlan";
import { WORKOUT_SESSION_PLAN_ENDPOINTS, WORKOUT_SESSION_PLAN_EXERCISES_ENDPOINTS } from "../endpoints/workoutSessionPlan";
import { WorkoutSessionPlanFormValues } from "@/schemas/workoutSessionPlan";

export const QUERY_KEY_WORKOUT_SESSION_PLANS = 'workout-session-plans';
/**
 * Fetches all workout session plans matching the given scope.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchAllWorkoutSessionPlans = async (
    scope: Scope = Scope.ALL,
    signal?: AbortSignal
) => {
    const { data } = await api.get<WorkoutSessionPlan[]>(WORKOUT_SESSION_PLAN_ENDPOINTS.workoutSessionPlans, {
        params: { scope },
        signal,
    });

    return data;
}

export const QUERY_KEY_WORKOUT_SESSION_PLAN = 'workout-session-plan';
/**
 * Fetches a single workout session plan by ID.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if fetch fails
 */
export const fetchWorkoutSessionPlanById = async (id: number, signal?: AbortSignal): Promise<WorkoutSessionPlan> => {
    const { data } = await api.get<WorkoutSessionPlan>(`${WORKOUT_SESSION_PLAN_ENDPOINTS.workoutSessionPlans}/${id}`, { signal });
    return data;
}

const mapWorkoutSessionPlanToApiFormat = (workoutSessionPlan: WorkoutSessionPlanFormValues): {
    name: string;
    description: string;
    isPublic: boolean;
    isApproved: boolean;
} => {
    return {
        name: workoutSessionPlan.name,
        description: workoutSessionPlan.description,
        isPublic: workoutSessionPlan.isPublic,
        isApproved: workoutSessionPlan.isApproved,
    }
}

const mapWorkoutSessionPlanExerciseToApiFormat = (exercise: {
    id?: number;
    exerciseId: number | undefined;
    sets: { reps: number }[];
}, workoutSessionPlanId: number, order: number): Omit<WorkoutSessionPlanExercise, 'id'> & Partial<Pick<WorkoutSessionPlanExercise, 'id'>> => {
    if (!exercise.exerciseId) {
        throw new ApiError('Exercise ID is required for each exercise');
    }

    return {
        id: exercise.id,
        workoutSessionPlanId,
        exerciseId: exercise.exerciseId,
        order,
        plannedSets: exercise.sets.length,
        plannedRepsPerSet: exercise.sets.map(set => set.reps),
    }
}

const mapWorkoutSessionPlanExercisesToApiFormat = (exercises: {
    id?: number;
    exerciseId: number | undefined;
    sets: { reps: number }[];
}[], workoutSessionPlanId: number): (Omit<WorkoutSessionPlanExercise, 'id'> & Partial<Pick<WorkoutSessionPlanExercise, 'id'>>)[] => {
    return exercises.map((exercise, index) => 
        mapWorkoutSessionPlanExerciseToApiFormat(exercise, workoutSessionPlanId, index + 1)
    );
}

/**
 * Creates a new workout session plan with associated exercises.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if creation fails
 */
export const createWorkoutSessionPlan = async (workoutSessionPlan: WorkoutSessionPlanFormValues): Promise<WorkoutSessionPlan> => {
    const mappedWorkoutSessionPlan = mapWorkoutSessionPlanToApiFormat(workoutSessionPlan);
    const { data } = await api.post<WorkoutSessionPlan>(`${WORKOUT_SESSION_PLAN_ENDPOINTS.workoutSessionPlans}`, mappedWorkoutSessionPlan);

    const workoutSessionPlanId = data.id;
    const workoutSessionPlanExercises = mapWorkoutSessionPlanExercisesToApiFormat(workoutSessionPlan.exercises, workoutSessionPlanId);
    await api.post(`${WORKOUT_SESSION_PLAN_EXERCISES_ENDPOINTS.bulk}`, workoutSessionPlanExercises);

    return data;
}

/**
 * Updates an existing workout session plan and its exercises.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if update fails
 */
export const updateWorkoutSessionPlan = async (id: number, workoutSessionPlan: WorkoutSessionPlanFormValues): Promise<WorkoutSessionPlan> => {
    const mappedWorkoutSessionPlan = mapWorkoutSessionPlanToApiFormat(workoutSessionPlan);
    const { data } = await api.patch<WorkoutSessionPlan>(`${WORKOUT_SESSION_PLAN_ENDPOINTS.workoutSessionPlans}/${id}`, mappedWorkoutSessionPlan);

    const workoutSessionPlanId = data.id;
    const workoutSessionPlanExercises = mapWorkoutSessionPlanExercisesToApiFormat(workoutSessionPlan.exercises, workoutSessionPlanId);
    await api.put(`${WORKOUT_SESSION_PLAN_EXERCISES_ENDPOINTS.bulk}`, workoutSessionPlanExercises, {
        params: {
            workoutSessionPlanId
        }
    });

    return data;
}

/**
 * Deletes a workout session plan.
 * Errors are automatically transformed to ApiError by axios interceptor.
 * @throws ApiError if deletion fails
 */
export const deleteWorkoutSessionPlan = async (id: number): Promise<WorkoutSessionPlan> => {
    const { data } = await api.delete(`${WORKOUT_SESSION_PLAN_ENDPOINTS.workoutSessionPlans}/${id}`);
    return data;
}