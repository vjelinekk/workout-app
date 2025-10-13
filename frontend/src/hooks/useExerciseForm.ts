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
            body_part: initialData.body_part ?? '',
            equipment: initialData.equipment ?? '',
            description: initialData.description ?? '',
            category_id: initialData.category_id ?? undefined,
            image_file: undefined,
            is_public: initialData.is_public ?? false,
            is_approved: initialData.is_approved ?? false,
        }
        : {
            name: '',
            body_part: '',
            equipment: '',
            description: '',
            category_id: undefined,
            image_file: undefined,
            is_public: false,
            is_approved: false,
        };

    const form = useForm<ExerciseFormValues>({
        resolver: zodResolver(schema),
        defaultValues: computedDefaults,
    });

    return form;
}