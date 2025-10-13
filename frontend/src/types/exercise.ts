export enum BodyPart {
    CHEST = 'Chest',
    TRAPS = 'Traps',
    BACK = 'Back',
    SHOULDERS = 'Shoulders',
    BICEPS = 'Biceps',
    TRICEPS = 'Triceps',
    FOREARMS = 'Forearms',
    QUADRICEPS = 'Quadriceps',
    HAMSTRINGS = 'Hamstrings',
    GLUTES = 'Glutes',
    CALVES = 'Calves',
    ABS = 'Abs',
    CORE = 'Core',
    FULL_BODY = 'Full Body',
};

export interface Exercise {
    id: number;
    name: string;
    body_part: BodyPart;
    equipment: string;
    description: string;
    category_id?: number;
    image_url: string;
    is_public: boolean;
    is_approved: boolean;
    created_by: number;
};
