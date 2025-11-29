'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useTrainingSplit } from '@/hooks/useTrainingSplits';
import { TrainingSplitForm } from '@/components/TrainingSplits/TrainingSplitForm/TrainingSplitForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/icons/spinner';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    id: number;
}

export const SplitApprovalEdit = ({ id }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.approvalsPage);
    const router = useRouter();
    const { data: split, isLoading, error } = useTrainingSplit(id);

    const handleBack = () => {
        router.push('/admin/approvals/splits');
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
                        {split?.name || 'Training Split Approval'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review and approve this training split
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

            {!isLoading && !error && split && (
                <TrainingSplitForm mode="edit" id={id} initialData={split} />
            )}
        </div>
    );
};
