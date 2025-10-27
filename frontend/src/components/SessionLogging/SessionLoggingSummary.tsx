'use client';

import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import type { WorkoutSession } from '@/types/workoutSession';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';

interface Props {
    workoutSession: WorkoutSession;
}

export const SessionLoggingSummary = ({ workoutSession }: Props) => {
    const t = useTranslations(
        TRANSLATION_SECTION_KEYS.sessionLoggingSummaryPage,
    );

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold leading-tight">
                    {t('title')}
                </h1>

                {workoutSession.workoutSessionPlan && (
                    <p className="text-lg font-medium text-foreground">
                        {workoutSession.workoutSessionPlan.name}
                    </p>
                )}

                {workoutSession.finishedAt && (
                    <p className="text-sm text-muted-foreground">
                        {new Date(
                            workoutSession.finishedAt,
                        ).toLocaleDateString()}{' '}
                        •{' '}
                        {new Date(
                            workoutSession.finishedAt,
                        ).toLocaleTimeString()}
                    </p>
                )}

                {workoutSession.notes && (
                    <p className="text-sm text-muted-foreground pt-2">
                        {workoutSession.notes}
                    </p>
                )}
            </div>

            <div className="space-y-4">
                {workoutSession.exercises?.map((exercise) => (
                    <Card key={exercise.id}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold">
                                {exercise.exercise?.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            {t('summaryTable.setHeader')}
                                        </TableHead>
                                        <TableHead className="text-right">
                                            {t('summaryTable.repsHeader')}
                                        </TableHead>
                                        <TableHead className="text-right">
                                            {t('summaryTable.weightHeader')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exercise.actualRepsPerSet.map(
                                        (reps, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {reps === null ? '-' : reps}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {exercise
                                                        .actualWeightPerSet[
                                                        index
                                                    ] === null
                                                        ? '-'
                                                        : t('weightWithKg', {
                                                              weight: String(
                                                                  exercise
                                                                      .actualWeightPerSet[
                                                                      index
                                                                  ],
                                                              ),
                                                          })}
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                            {exercise.notes && (
                                <p className="text-sm text-muted-foreground pt-1">
                                    {exercise.notes}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
