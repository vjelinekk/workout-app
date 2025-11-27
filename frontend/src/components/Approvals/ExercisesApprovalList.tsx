'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useExercises } from '@/hooks/useExercises';
import { Scope } from '@/types/scope';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/icons/spinner';
import { ChevronLeft } from 'lucide-react';

export const ExercisesApprovalList = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.approvalsPage);
    const router = useRouter();
    const { data: exercises, isLoading, error } = useExercises(
        Scope.WAITING_FOR_APPROVAL,
    );

    const handleBack = () => {
        router.push('/admin/approvals');
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="shrink-0"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold">{t('exercises')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('exercisesDescription')}
                    </p>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-12">
                    <Spinner />
                </div>
            )}

            {error && (
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-destructive">
                            {t('errorLoading')}
                        </p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !error && exercises && exercises.length === 0 && (
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">
                            {t('noPendingItems')}
                        </p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !error && exercises && exercises.length > 0 && (
                <div className="space-y-4">
                    {exercises.map((exercise) => (
                        <Link
                            key={exercise.id}
                            href={`/admin/approvals/exercises/${exercise.id}`}
                        >
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {exercise.name}
                                    </CardTitle>
                                    {exercise.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {exercise.description}
                                        </p>
                                    )}
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
