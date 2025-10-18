export interface TrainingSplit {
    id: number;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
    name: string;
    description: string;
    is_public: boolean;
    is_approved: boolean;
    training_split_days?: TrainingSplitDay[];
}

export interface TrainingSplitDay {
    id: number;
    training_split_id: number;
    day_of_week: number;
    workout_session_plan_id: number;
}