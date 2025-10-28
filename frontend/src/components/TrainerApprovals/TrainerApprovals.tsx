'use client';

import Link from 'next/link';
import { Check, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useResolveApplication, useUsers } from '@/hooks/useUsers';
import { Spinner } from '../ui/icons/spinner';
import { BasicFormAlert } from '../BasicForm/BasicFormAlert';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

export const TrainerApprovals = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.trainerApprovalsPage);
    const {
        data: trainerApplications,
        isLoading,
        isError,
        error,
    } = useUsers(true);
    const { mutate: resolveApplication } = useResolveApplication();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Spinner />
            </div>
        );
    }

    if (isError) {
        return (
            <BasicFormAlert
                title={t('errorOccurred')}
                description={error?.message || t('unknownError')}
                variant="destructive"
                isDismissible={false}
                autoDismiss={false}
                show={true}
            />
        );
    }

    if (!trainerApplications) {
        return (
            <Card className="p-8 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                    {t('noPendingApplications')}
                </p>
            </Card>
        );
    }

    const handleApprove = (id: number) => {
        resolveApplication({ id, approve: true });
    };

    const handleDeny = (id: number) => {
        resolveApplication({ id, approve: false });
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
                        {t('title')}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground md:text-base">
                        {t('description')}
                    </p>
                </div>

                <div className="space-y-4">
                    {trainerApplications.length === 0 ? (
                        <Card className="p-8 text-center">
                            <User className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">
                                {t('noPendingApplications')}
                            </p>
                        </Card>
                    ) : (
                        trainerApplications.map((application) => (
                            <Card
                                key={application.id}
                                className="overflow-hidden transition-shadow hover:shadow-md"
                            >
                                <div className="p-4 md:p-6">
                                    <div className="flex flex-col gap-4">
                                        {/* User Info */}
                                        <div className="flex items-start justify-between gap-4">
                                            <Link
                                                href={`/profile/${application.id}`}
                                                className="group flex items-center gap-2"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-base font-medium text-foreground group-hover:underline md:text-lg">
                                                        {application.firstName}{' '}
                                                        {application.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground md:text-sm">
                                                        {t('viewProfile')}
                                                    </p>
                                                </div>
                                            </Link>
                                        </div>

                                        {/* Reason */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Reason
                                            </p>
                                            <p className="text-sm leading-relaxed text-foreground md:text-base">
                                                {
                                                    application.becomeTrainerReason
                                                }
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                                            <Button
                                                onClick={() =>
                                                    handleApprove(
                                                        application.id,
                                                    )
                                                }
                                                className="flex-1 gap-2"
                                                size="default"
                                            >
                                                <Check className="h-4 w-4" />
                                                {t('approve')}
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    handleDeny(application.id)
                                                }
                                                variant="outline"
                                                className="flex-1 gap-2"
                                                size="default"
                                            >
                                                <X className="h-4 w-4" />
                                                {t('deny')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
