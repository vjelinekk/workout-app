import * as z from 'zod';

export const exerciseSchema = (
    nameValidation: string,
    bodyPartValidation: string,
    equipmentValidation: string,
    descriptionValidation: string,
    categoryIdPositiveValidation: string,
) => z.object({
    name: z.string().min(1, nameValidation),
    bodyPart: z.string().min(1, bodyPartValidation),
    equipment: z.string().min(1, equipmentValidation),
    description: z.string().min(1, descriptionValidation),
    // category is optional — allow undefined when no category is chosen
    categoryId: z.number().int().positive(categoryIdPositiveValidation).optional(),
    imageUrl: z.string().optional(),
    imageFile: z.file().optional(),
    isPublic: z.boolean(),
    isApproved: z.boolean(),
});

export type ExerciseFormValues = z.infer<ReturnType<typeof exerciseSchema>>;