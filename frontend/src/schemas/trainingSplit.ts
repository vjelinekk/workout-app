import * as z from 'zod';

export const workoutSessionPlanExerciseSetSchema = (repsValidation: string) => z.object({
    reps: z.number().min(1, repsValidation),
});

export const trainingSplitDaySchema = (
) => z.object({
    id: z.number().optional(),
    workoutSessionPlanId: z.number().min(1),
    dayOfWeek: z.number().min(1).max(7),
});

export const trainingSplitSchema = (
    nameValidation: string,
    descriptionValidation: string,
) => z.object({
    name: z.string().min(1, nameValidation),
    description: z.string().min(1, descriptionValidation),
    isPublic: z.boolean(),
    isApproved: z.boolean(),
    days: z.array(trainingSplitDaySchema()),
});

export type TrainingSplitFormValues = z.infer<ReturnType<typeof trainingSplitSchema>>;