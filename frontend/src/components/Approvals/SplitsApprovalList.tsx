'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useTrainingSplits } from '@/hooks/useTrainingSplits';
import { Scope } from '@/types/scope';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/icons/spinner';
import { ChevronLeft } from 'lucide-react';

export const SplitsApprovalList = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.approvalsPage);
    const router = useRouter();
    const {
        data: splits,
        isLoading,
        error,
    } = useTrainingSplits(Scope.WAITING_FOR_APPROVAL);

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
                    <h1 className="text-2xl font-semibold">
                        {t('trainingSplits')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('trainingSplitsDescription')}
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

            {!isLoading && !error && splits && splits.length === 0 && (
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">
                            {t('noPendingItems')}
                        </p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !error && splits && splits.length > 0 && (
                <div className="space-y-4">
                    {splits.map((split) => (
                        <Link
                            key={split.id}
                            href={`/admin/approvals/splits/${split.id}`}
                        >
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {split.name}
                                    </CardTitle>
                                    {split.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {split.description}
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
