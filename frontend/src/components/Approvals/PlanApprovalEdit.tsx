'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useWorkoutSessionPlan } from '@/hooks/useWorkoutSessionPlans';
import { WorkoutSessionPlanForm } from '@/components/WorkoutSessionPlans/WorkoutSessionPlanForm/WorkoutSessionPlanForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/icons/spinner';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    id: number;
}

export const PlanApprovalEdit = ({ id }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.approvalsPage);
    const router = useRouter();
    const { data: plan, isLoading, error } = useWorkoutSessionPlan(id);

    const handleBack = () => {
        router.push('/admin/approvals/plans');
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
                    <h1 className="text-2xl font-semibold">
                        {plan?.name || 'Workout Plan Approval'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review and approve this workout session plan
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

            {!isLoading && !error && plan && (
                <WorkoutSessionPlanForm mode="edit" id={id} initialData={plan} />
            )}
        </div>
    );
};
