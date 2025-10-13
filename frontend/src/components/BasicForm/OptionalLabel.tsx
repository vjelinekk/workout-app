import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useTranslations } from 'next-intl';

interface Props {
    label: string;
}

export const OptionalLabel = ({ label }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.common);

    return (
        <>
            {label}{' '}
            <span className="text-muted-foreground">({t('optional')})</span>
        </>
    );
};
