'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/icons/spinner';
import { useTrainingSplitAssignedToUser } from '@/hooks/useTrainingSplits';
import { Settings } from 'lucide-react';
import { SessionLoggingStart } from './SessionLoggingStart';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import Link from 'next/link';
import { TRAINING_SPLIT_ERROR_CODES } from '@/constants/trainingSplit';

export const TrainingSplitAssigned = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.sessionLoggingPage);
    const {
        data: trainingSplit,
        error,
        isLoading,
    } = useTrainingSplitAssignedToUser();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Spinner />
            </div>
        );
    }

    if (
        error &&
        error.errorCode !== TRAINING_SPLIT_ERROR_CODES.noAssignedTrainingSplit
    ) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>{t('errorLoadingTrainingSplit')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600">{error.message}</p>
                </CardContent>
            </Card>
        );
    }

    // Handle case when no active split
    if (
        !trainingSplit ||
        error?.errorCode === TRAINING_SPLIT_ERROR_CODES.noAssignedTrainingSplit
    ) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>{t('noActiveTrainingSplit')}</CardTitle>
                    <CardDescription>
                        {t('noActiveTrainingSplitDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/settings">
                            <Settings className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return <SessionLoggingStart activeTrainingSplit={trainingSplit} />;
};
