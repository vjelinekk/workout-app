'use client';

import {
    QUERY_KEY_WORKOUT_SESSION,
    useWorkoutSession,
} from '@/hooks/useWorkoutSessions';
import { SessionLoggingRunning } from './SessionLoggingRunning';
import { Spinner } from '../ui/icons/spinner';
import { WorkoutSessionStatusEnum } from '@/types/workoutSession';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BasicFormAlert } from '../BasicForm/BasicFormAlert';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useTranslations } from 'next-intl';

interface Props {
    workoutSessionId: number;
}

export const SessionLoggingRunningWrapper = ({ workoutSessionId }: Props) => {
    const {
        data: workoutSession,
        isLoading,
        error,
    } = useWorkoutSession(workoutSessionId);
    const router = useRouter();
    const queryClient = useQueryClient();
    const t = useTranslations(TRANSLATION_SECTION_KEYS.sessionLoggingPage);

    useEffect(() => {
        if (workoutSession?.status === WorkoutSessionStatusEnum.COMPLETED) {
            router.push(`/session-logging/${workoutSessionId}/summary`);
            queryClient.setQueryData(
                [QUERY_KEY_WORKOUT_SESSION, workoutSessionId],
                workoutSession,
            );
        }
    }, [workoutSession?.status, workoutSessionId, router]);

    if (workoutSession?.status === WorkoutSessionStatusEnum.COMPLETED) {
        return (
            <div className="flex justify-center items-center py-8">
                <Spinner />
            </div>
        );
    }

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
                description={t('unexpectedStartError')}
            />
        );
    }

    return <SessionLoggingRunning workoutSession={workoutSession} />;
};
