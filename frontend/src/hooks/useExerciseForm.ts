import { TRANSLATION_SECTION_KEYS } from "@/constants/locale";
import { ExerciseFormValues, exerciseSchema } from "@/schemas/exercise";
import { Exercise } from "@/types/exercise";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

export const useExerciseForm = (initialData?: Exercise) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.exerciseForm);

    const schema = exerciseSchema(
        t('validation.nameRequired'),
        t('validation.bodyPartRequired'),
        t('validation.equipmentRequired'),
        t('validation.descriptionRequired'),
        t('validation.categoryIdPositive'),
    );

    const computedDefaults: ExerciseFormValues = initialData
        ? {
            name: initialData.name ?? '',
            bodyPart: initialData.bodyPart ?? '',
            equipment: initialData.equipment ?? '',
            description: initialData.description ?? '',
            categoryId: initialData.categoryId ?? undefined,
            imageFile: undefined,
            isPublic: initialData.isPublic ?? false,
            isApproved: initialData.isApproved ?? false,
        }
        : {
            name: '',
            bodyPart: '',
            equipment: '',
            description: '',
            categoryId: undefined,
            imageFile: undefined,
            isPublic: false,
            isApproved: false,
        };

    const form = useForm<ExerciseFormValues>({
        resolver: zodResolver(schema),
        defaultValues: computedDefaults,
    });

    return form;
}