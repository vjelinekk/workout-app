import { TRANSLATION_SECTION_KEYS } from "@/constants/locale";
import { useTranslations } from "next-intl";

export const useDaysTranslation = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.common);

    const daysOfWeekTranslations: Record<number, { name: string; shortName: string }> = {
        1: { name: t('days.monday'), shortName: t('days.mon') },
        2: { name: t('days.tuesday'), shortName: t('days.tue') },
        3: { name: t('days.wednesday'), shortName: t('days.wed') },
        4: { name: t('days.thursday'), shortName: t('days.thu') },
        5: { name: t('days.friday'), shortName: t('days.fri') },
        6: { name: t('days.saturday'), shortName: t('days.sat') },
        7: { name: t('days.sunday'), shortName: t('days.sun') },
    };

    return { daysOfWeekTranslations };
}