'use client';

import { useTranslations } from 'next-intl';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, UserCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/icons/spinner';
import {
    TrainerTraineeResponse,
    TrainerTraineeStatus,
} from '@/types/trainerTrainee';
import Link from 'next/link';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { ApiError } from '@/utils/apiError';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface Props {
    trainers?: TrainerTraineeResponse[];
    isLoading: boolean;
    error?: ApiError | null;
    onAcceptTrainer: (trainerId: number) => void;
    onDenyTrainer: (trainerId: number) => void;
}

export const TrainersManagementSection = ({
    trainers,
    isLoading,
    error,
    onAcceptTrainer,
    onDenyTrainer,
}: Props) => {
    const t = useTranslations(
        TRANSLATION_SECTION_KEYS.settingsPage + '.trainers',
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {isLoading && (
                        <div className="flex justify-center items-center">
                            <Spinner />
                        </div>
                    )}
                    {error && (
                        <div className="text-red-500">
                            {t('errorLoading')} {error?.message}
                        </div>
                    )}
                    {!trainers && (
                        <div className="text-muted-foreground">
                            {t('noTrainers')}
                        </div>
                    )}
                    {trainers && trainers.length === 0 && !isLoading && (
                        <div className="text-muted-foreground">
                            {t('noTrainers')}
                        </div>
                    )}

                    {trainers &&
                        trainers.map((trainer) => {
                            if (!trainer.trainer) return null;

                            return (
                                <div
                                    key={trainer.id}
                                    className="rounded-lg border border-border bg-card p-4"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <Link
                                            href={`/profile/${trainer.trainer.id}`}
                                        >
                                            <p className="font-medium">
                                                {trainer.trainer.firstName}{' '}
                                                {trainer.trainer.lastName}
                                            </p>

                                            {trainer.status ===
                                                TrainerTraineeStatus.ACTIVE && (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <UserCheck className="h-4 w-4" />
                                                    <span>{t('current')}</span>
                                                </div>
                                            )}
                                        </Link>
                                    </div>
                                    <div className="mt-1">
                                        <StatusBadge status={trainer.status} />
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        {trainer.status ===
                                            TrainerTraineeStatus.PENDING && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() =>
                                                        onAcceptTrainer(
                                                            trainer.id,
                                                        )
                                                    }
                                                    className="gap-1"
                                                >
                                                    <Check className="h-4 w-4" />
                                                    {t('accept')}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        onDenyTrainer(
                                                            trainer.id,
                                                        )
                                                    }
                                                    className="gap-1"
                                                >
                                                    <X className="h-4 w-4" />
                                                    {t('deny')}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </CardContent>
        </Card>
    );
};
