'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Dumbbell, PlayCircle } from 'lucide-react';
import { TrainingSplit } from '@/types/trainingSplit';
import { useCurrentSession } from '@/hooks/useSessionLogging';
import { SessionLoggingHeader } from './SessionLoggingHeader';
import { SessionSelector } from './SessionSelector';
import { SessionExerciseItem } from './SessionExerciseItem';
import {
    QUERY_KEY_WORKOUT_SESSION,
    useFinishWorkoutSession,
    useStartWorkoutSession,
    useWorkoutSessionInProgress,
} from '@/hooks/useWorkoutSessions';
import { ApiError } from '@/utils/apiError';
import { useState } from 'react';
import { BasicFormAlert } from '../BasicForm/BasicFormAlert';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Spinner } from '../ui/icons/spinner';

interface Props {
    activeTrainingSplit: TrainingSplit;
}

export const SessionLoggingStart = ({ activeTrainingSplit }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.sessionLoggingPage);
    const {
        currentSession,
        currentSessionKey,
        setCurrentSessionKey,
        availableSessions,
    } = useCurrentSession(activeTrainingSplit);
    const { mutateAsync: startWorkoutSession } = useStartWorkoutSession();
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [error, setError] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const {
        data: workoutSessionInProgress,
        isLoading: isLoadingWorkoutSessionInProgress,
    } = useWorkoutSessionInProgress();
    const { mutate: finishWorkoutSession } = useFinishWorkoutSession();

    const handleContinueWorkout = () => {
        if (workoutSessionInProgress) {
            router.push(`/session-logging/${workoutSessionInProgress.id}`);
            queryClient.setQueryData(
                [QUERY_KEY_WORKOUT_SESSION, workoutSessionInProgress.id],
                workoutSessionInProgress,
            );
        }
    };

    if (isLoadingWorkoutSessionInProgress) {
        return (
            <div className="flex justify-center items-center py-8">
                <Spinner />
            </div>
        );
    }

    if (workoutSessionInProgress) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent>
                    <div className="text-center py-8 space-y-4">
                        <PlayCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">
                            There is a workout session in progress
                        </p>

                        {/* Buttons */}
                        <div className="flex justify-center gap-4">
                            <Button onClick={handleContinueWorkout}>
                                Continue Workout
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() =>
                                    finishWorkoutSession({
                                        workoutSessionId:
                                            workoutSessionInProgress.id,
                                        progressData: {},
                                    })
                                }
                            >
                                Finish Workout
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Handle case when no workout for today
    if (!currentSession) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <SessionLoggingHeader name={activeTrainingSplit.name} />
                <CardContent>
                    <div className="text-center py-8">
                        <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">
                            No Workout Scheduled
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Rest day or no workout assigned for today.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleStartWorkout = async () => {
        const trainingSplitId = activeTrainingSplit.id;
        const workoutSessionPlanId = currentSession.id;

        try {
            const result = await startWorkoutSession({
                workoutSessionPlanId,
                trainingSplitId,
            });
            const id = result.id;

            queryClient.setQueryData([QUERY_KEY_WORKOUT_SESSION, id], result);

            router.push(`/session-logging/${id}`);
        } catch (error: unknown) {
            setError(true);

            if (error instanceof ApiError) {
                setErrorMessage(error.message);
                return;
            }

            setErrorMessage(t('unexpectedStartError'));
        }
    };

    return (
        <>
            <BasicFormAlert
                title={errorMessage}
                show={error}
                autoDismiss={false}
                variant="destructive"
                dismissCallback={() => setError(false)}
            />
            <Card className="w-full max-w-2xl mx-auto">
                <SessionLoggingHeader name={activeTrainingSplit.name} />
                <CardHeader className="space-y-2">
                    <SessionSelector
                        currentSessionKey={currentSessionKey}
                        setCurrentSessionKey={setCurrentSessionKey}
                        availableSessions={availableSessions}
                        currentSession={currentSession}
                    />
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Exercise List */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Exercises</h3>
                        <div className="space-y-2">
                            {currentSession?.exercises?.map(
                                (exercise, index) => (
                                    <SessionExerciseItem
                                        key={exercise.id}
                                        exercise={exercise}
                                        index={index}
                                    />
                                ),
                            )}
                        </div>
                    </div>

                    {/* Start Workout Button */}
                    <Button
                        onClick={() => void handleStartWorkout()}
                        size="lg"
                        className="w-full"
                    >
                        <Play className="mr-2 h-5 w-5" />
                        {t('startSession')}
                    </Button>
                </CardContent>
            </Card>
        </>
    );
};
