import { TRANSLATION_SECTION_KEYS } from "@/constants/locale";
import { BecomeTrainerFormValues, becomeTrainerSchema } from "@/schemas/becomeTrainer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

export const useBecomeTrainerForm = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.becomeTrainerPage);

    const schema = becomeTrainerSchema(
        t('reasonErrorShort'),
        t('reasonErrorLong'),
    );

    const form = useForm<BecomeTrainerFormValues>({
        defaultValues: {
            reason: '',
        },
        resolver: zodResolver(schema),
    });

    return form;
}