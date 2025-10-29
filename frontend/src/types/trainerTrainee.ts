import { UserResponse } from "./user";

export enum TrainerTraineeStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    REMOVED = 'removed',
}

export interface TrainerTraineeResponse {
    id: number;
    status: TrainerTraineeStatus;
    trainer: UserResponse;
}

export interface TraineeResponse {
    id: number;
    firstName: string;
    lastName: string;
    activeTrainingSplitId?: number;
    pendingTrainingSplitIdList: number[];
}