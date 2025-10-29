import { TrainingSplit } from "./trainingSplit";

export enum TrainingSplitAssignmentStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
}

export interface TrainingSplitAssignmentResponse {
    id: number;
    traineeId: number;
    trainingSplit: TrainingSplit;
    status: TrainingSplitAssignmentStatus;
    assignedById: number;
}