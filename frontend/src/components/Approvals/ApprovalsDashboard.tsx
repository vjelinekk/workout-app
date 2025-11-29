'use client';

import React from 'react';
import Link from 'next/link';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Dumbbell, Calendar, Layout } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useExercises } from '@/hooks/useExercises';
import { useWorkoutSessionPlans } from '@/hooks/useWorkoutSessionPlans';
import { useTrainingSplits } from '@/hooks/useTrainingSplits';
import { Scope } from '@/types/scope';
import { Spinner } from '@/components/ui/icons/spinner';
import { Badge } from '@/components/ui/badge';

export const ApprovalsDashboard = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.approvalsPage);

    const { data: exercises, isLoading: isLoadingExercises } = useExercises(
        Scope.WAITING_FOR_APPROVAL,
    );
    const { data: plans, isLoading: isLoadingPlans } = useWorkoutSessionPlans(
        Scope.WAITING_FOR_APPROVAL,
    );
    const { data: splits, isLoading: isLoadingSplits } = useTrainingSplits(
        Scope.WAITING_FOR_APPROVAL,
    );

    const approvalCategories = [
        {
            id: 'exercises',
            title: t('exercises'),
            description: t('exercisesDescription'),
            href: '/admin/approvals/exercises',
            icon: <Dumbbell className="w-6 h-6" />,
            count: exercises?.length ?? 0,
            isLoading: isLoadingExercises,
        },
        {
            id: 'plans',
            title: t('workoutSessionPlans'),
            description: t('workoutSessionPlansDescription'),
            href: '/admin/approvals/plans',
            icon: <Calendar className="w-6 h-6" />,
            count: plans?.length ?? 0,
            isLoading: isLoadingPlans,
        },
        {
            id: 'splits',
            title: t('trainingSplits'),
            description: t('trainingSplitsDescription'),
            href: '/admin/approvals/splits',
            icon: <Layout className="w-6 h-6" />,
            count: splits?.length ?? 0,
            isLoading: isLoadingSplits,
        },
    ];

    return (
        <div className="w-full max-w-screen-xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {approvalCategories.map((category) => (
                    <Link
                        key={category.id}
                        href={category.href}
                        className="block h-full"
                    >
                        <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center rounded-md bg-muted p-3 text-muted-foreground">
                                            {category.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <CardTitle className="text-lg font-medium">
                                                {category.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm text-muted-foreground">
                                                {category.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {category.isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Spinner className="w-4 h-4" />
                                        <span className="text-sm text-muted-foreground">
                                            Loading...
                                        </span>
                                    </div>
                                ) : (
                                    <Badge
                                        variant={
                                            category.count > 0
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {category.count} {t('pending')}
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};
