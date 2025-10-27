'use client';

import { useWorkoutSession } from '@/hooks/useWorkoutSessions';
import { SessionLoggingSummary } from './SessionLoggingSummary';
import { Spinner } from '../ui/icons/spinner';
import { BasicFormAlert } from '../BasicForm/BasicFormAlert';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface Props {
    workoutSessionId: number;
}

export const SessionLoggingSummaryWrapper = ({ workoutSessionId }: Props) => {
    const {
        data: workoutSession,
        isLoading,
        error,
    } = useWorkoutSession(workoutSessionId);
    const t = useTranslations(TRANSLATION_SECTION_KEYS.sessionLoggingPage);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Spinner />
            </div>
        );
    }

    if (error || !workoutSession) {
        return (
            <BasicFormAlert
                title={t('errorOccurred')}
                show={true}
                variant="destructive"
                isDismissible={false}
                description={t('unexpectedSummaryError')}
            />
        );
    }

    return <SessionLoggingSummary workoutSession={workoutSession} />;
};
