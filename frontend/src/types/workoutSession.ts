import { Exercise } from "./exercise";
import { TrainingSplit } from "./trainingSplit";
import { WorkoutSessionPlan } from "./workoutSessionPlan";

export enum WorkoutSessionStatusEnum {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
}

export interface WorkoutSessionExercise {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    workoutSessionId: number;
    exerciseId: number;
    exercise?: Exercise;
    order: number;
    previousRepsPerSet: number[] | null;
    actualRepsPerSet: (number | null)[];
    previousWeightPerSet: number[] | null;
    actualWeightPerSet: (number | null)[];
    notes?: string;
}

export interface WorkoutSession {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    performedById: number | null;
    workoutSessionPlanId: number;
    workoutSessionPlan?: WorkoutSessionPlan;
    trainingSplitId?: number;
    trainingSplit?: TrainingSplit;
    status: WorkoutSessionStatusEnum;
    startedAt?: Date;
    finishedAt?: Date;
    notes?: string;
    durationSeconds?: number;
    exercises?: WorkoutSessionExercise[];
}

export interface SessionLoggingData {
    [exerciseId: number]: {
        [setIndex: number]: {
            reps: number | null;
            weight: number | null;
        }
    }
}