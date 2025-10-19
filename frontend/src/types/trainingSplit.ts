import { WorkoutSessionPlan } from "./workoutSessionPlan";

export interface TrainingSplit {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    name: string;
    description: string;
    isPublic: boolean;
    isApproved: boolean;
    days?: TrainingSplitDay[];
}

export interface TrainingSplitDay {
    id: number;
    trainingSplitId: number;
    dayOfWeek: number;
    workoutSessionPlanId: number;
    workoutSessionPlan?: WorkoutSessionPlan;
}