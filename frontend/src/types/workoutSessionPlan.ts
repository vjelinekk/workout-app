import { Exercise } from "./exercise";

export interface WorkoutSessionPlan {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    name: string;
    description: string;
    createdBy: number;
    isPublic: boolean;
    isApproved: boolean;
    exercises?: WorkoutSessionPlanExercise[];
}

export interface WorkoutSessionPlanExercise {
    id: number;
    workoutSessionPlanId: number;
    exerciseId: number;
    exercise?: Exercise;
    order: number;
    plannedSets: number;
    plannedRepsPerSet: number[];
}