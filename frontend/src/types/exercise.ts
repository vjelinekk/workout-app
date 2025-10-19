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
    bodyPart: BodyPart;
    equipment: string;
    description: string;
    categoryId?: number;
    imageUrl: string;
    isPublic: boolean;
    isApproved: boolean;
    createdBy: number;
};
