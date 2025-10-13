import * as z from 'zod';

export const exerciseSchema = (
    nameValidation: string,
    bodyPartValidation: string,
    equipmentValidation: string,
    descriptionValidation: string,
    categoryIdPositiveValidation: string,
) => z.object({
    name: z.string().min(1, nameValidation),
    body_part: z.string().min(1, bodyPartValidation),
    equipment: z.string().min(1, equipmentValidation),
    description: z.string().min(1, descriptionValidation),
    // category is optional — allow undefined when no category is chosen
    category_id: z.number().int().positive(categoryIdPositiveValidation).optional(),
    image_file: z.file().optional(),
    is_public: z.boolean(),
    is_approved: z.boolean(),
});

export type ExerciseFormValues = {
    name: string;
    body_part: string;
    equipment: string;
    description: string;
    category_id?: number | undefined;
    image_file?: File | undefined;
    is_public: boolean;
    is_approved: boolean;
};