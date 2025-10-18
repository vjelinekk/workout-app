import * as z from 'zod';

export const workoutSessionPlanExerciseSetSchema = (repsValidation: string) => z.object({
    reps: z.number().min(1, repsValidation),
});

export const workoutSessionPlanExerciseSchema = (
    exerciseIdValidation: string,
    repsValidation: string,
    oneSetValidation: string,
) => z.object({
    id: z.number().optional(),
    exercise_id: z.union([z.number().min(1, exerciseIdValidation), z.undefined()])
        .refine((val) => val !== undefined && val >= 1, {
            message: exerciseIdValidation,
        }),
    sets: z.array(workoutSessionPlanExerciseSetSchema(repsValidation)).min(1, oneSetValidation),
});

export const workoutSessionPlanSchema = (
    nameValidation: string,
    descriptionValidation: string,
    oneExerciseValidation: string,
    exerciseIdValidation: string,
    repsValidation: string,
    oneSetValidation: string,
) => z.object({
    name: z.string().min(1, nameValidation),
    description: z.string().min(1, descriptionValidation),
    is_public: z.boolean(),
    is_approved: z.boolean(),
    exercises: z.array(workoutSessionPlanExerciseSchema(
        exerciseIdValidation,
        repsValidation,
        oneSetValidation,
    )).min(1, oneExerciseValidation),
});

export type WorkoutSessionPlanFormValues = {
    name: string;
    description: string;
    is_public: boolean;
    is_approved: boolean;
    exercises: Array<{
        id?: number;
        exercise_id: number | undefined;
        sets: Array<{
            reps: number;
        }>;
    }>;
};