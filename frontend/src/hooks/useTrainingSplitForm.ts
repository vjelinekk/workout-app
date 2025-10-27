import { TRANSLATION_SECTION_KEYS } from "@/constants/locale";
import { TrainingSplitFormValues, trainingSplitSchema } from "@/schemas/trainingSplit";
import { TrainingSplit } from "@/types/trainingSplit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { init } from "next/dist/compiled/webpack/webpack";
import { useForm } from "react-hook-form";

export const useTrainingSplitForm = (initialData?: TrainingSplit) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.trainingSplitsForm);

    const schema = trainingSplitSchema(
        t('validation.nameRequired'),
        t('validation.descriptionRequired'),
    );

    const computedDefaults: TrainingSplitFormValues = initialData
        ? {
            name: initialData.name ?? '',
            description: initialData.description ?? '',
            isPublic: initialData.isPublic ?? false,
            isApproved: initialData.isApproved ?? false,
            days: initialData.days ?? [],
        }
        : {
            name: '',
            description: '',
            isPublic: false,
            isApproved: false,
            days: [],
        };

    const form = useForm<TrainingSplitFormValues>({
        resolver: zodResolver(schema),
        defaultValues: computedDefaults,
    });

    return form;
}