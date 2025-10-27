'use client';

import { WorkoutSession, WorkoutSessionExercise } from '@/types/workoutSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import { useWorkoutSessionAutosave } from '@/hooks/useWorkoutSessionAutosave';
import { useRouter } from 'next/navigation';
import { useWorkoutSessionTimeSyncing } from '@/hooks/useWorkoutSessionTimeSyncing';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface Props {
    workoutSession: WorkoutSession;
}

export const SessionLoggingRunning = ({ workoutSession }: Props) => {
    const { elapsedTime, isPaused, setIsPaused, formatTime } =
        useWorkoutSessionTimeSyncing(workoutSession);
    const { sessionData, handleInputChange, finishWorkout } =
        useWorkoutSessionAutosave({
            workoutSessionId: workoutSession.id,
        });
    const router = useRouter();
    const t = useTranslations(TRANSLATION_SECTION_KEYS.sessionLoggingPage);

    const getPreviousSetData = (
        exercise: WorkoutSessionExercise,
        setIndex: number,
    ) => {
        if (
            exercise &&
            exercise.previousRepsPerSet &&
            exercise.previousWeightPerSet &&
            exercise.previousRepsPerSet.length > setIndex &&
            exercise.previousWeightPerSet.length > setIndex
        ) {
            const previousReps = exercise.previousRepsPerSet[setIndex];
            const previousWeight = exercise.previousWeightPerSet[setIndex];
            return { previousReps, previousWeight };
        }

        return { previousReps: null, previousWeight: null };
    };

    const handleFinish = async (): Promise<void> => {
        await finishWorkout();
        router.push(`/session-logging/${workoutSession.id}/summary`);
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Top Bar with Timer */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 px-4 py-3">
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                        aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
                    >
                        {isPaused ? (
                            <Play className="h-5 w-5 text-foreground fill-foreground" />
                        ) : (
                            <Pause className="h-5 w-5 text-foreground" />
                        )}
                    </button>
                    <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                        {formatTime(elapsedTime)}
                    </span>
                </div>
            </div>

            {/* Exercise Cards */}
            <div className="px-4 py-6 space-y-4">
                {workoutSession.exercises?.map((exercise) => (
                    <Card key={exercise.id} className="border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xl font-bold text-foreground">
                                {exercise.exercise?.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {exercise.actualRepsPerSet.map((set, index) => {
                                const { previousReps, previousWeight } =
                                    getPreviousSetData(exercise, index);

                                return (
                                    <div
                                        key={index + 1}
                                        className="bg-secondary/50 rounded-lg p-4 space-y-3"
                                    >
                                        {previousReps && previousWeight && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold">
                                                    {t('set', {
                                                        setNumber: index + 1,
                                                    })}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {t('lastReps', {
                                                        previousReps,
                                                    })}{' '}
                                                    /{' '}
                                                    {t('weightWithKg', {
                                                        weight: previousWeight,
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor={`reps-${exercise.id}-${index + 1}`}
                                                    className="text-xs font-medium"
                                                >
                                                    Reps
                                                </Label>
                                                <Input
                                                    id={`reps-${exercise.id}-${index + 1}`}
                                                    type="number"
                                                    min={0}
                                                    inputMode="numeric"
                                                    placeholder={
                                                        previousReps
                                                            ? previousReps.toString()
                                                            : ''
                                                    }
                                                    value={
                                                        sessionData[
                                                            exercise.id
                                                        ]?.[index + 1]?.reps ||
                                                        ''
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            exercise.id,
                                                            index + 1,
                                                            'reps',
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === '-' ||
                                                            e.key === 'e'
                                                        )
                                                            e.preventDefault();
                                                    }}
                                                    onPaste={(e) => {
                                                        const paste =
                                                            e.clipboardData.getData(
                                                                'text',
                                                            );
                                                        if (
                                                            paste.startsWith(
                                                                '-',
                                                            )
                                                        )
                                                            e.preventDefault();
                                                    }}
                                                    className="h-12 text-lg font-semibold bg-background border-border focus:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor={`weight-${exercise.id}-${index + 1}`}
                                                    className="text-xs font-medium"
                                                >
                                                    {t('weightColumnTitle')}
                                                </Label>
                                                <Input
                                                    id={`weight-${exercise.id}-${index + 1}`}
                                                    type="number"
                                                    inputMode="decimal"
                                                    min={0}
                                                    placeholder={
                                                        previousWeight
                                                            ? previousWeight.toString()
                                                            : ''
                                                    }
                                                    value={
                                                        sessionData[
                                                            exercise.id
                                                        ]?.[index + 1]
                                                            ?.weight || ''
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            exercise.id,
                                                            index + 1,
                                                            'weight',
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === '-' ||
                                                            e.key === 'e'
                                                        )
                                                            e.preventDefault();
                                                    }}
                                                    onPaste={(e) => {
                                                        const paste =
                                                            e.clipboardData.getData(
                                                                'text',
                                                            );
                                                        if (
                                                            paste.startsWith(
                                                                '-',
                                                            )
                                                        )
                                                            e.preventDefault();
                                                    }}
                                                    className="h-12 text-lg font-semibold bg-background border-border focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
                <Button
                    size="lg"
                    className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => void handleFinish()}
                >
                    {t('finishWorkout')}
                </Button>
            </div>
        </div>
    );
};
