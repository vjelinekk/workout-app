import Link from 'next/link';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface Props {
    name: string;
}

export const SessionLoggingHeader = ({ name }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.sessionLoggingPage);

    return (
        <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl truncate">{name}</CardTitle>
                    <CardDescription className="mt-1">
                        {t('activeTrainingSplit')}
                    </CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    asChild
                    className="shrink-0 bg-transparent"
                >
                    <Link href="/settings">
                        <Settings className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </CardHeader>
    );
};
