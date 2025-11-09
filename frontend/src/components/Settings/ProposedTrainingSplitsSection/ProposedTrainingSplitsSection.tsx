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
import { Check, X } from 'lucide-react';
import { Spinner } from '@/components/ui/icons/spinner';
import { TrainerTraineeResponse } from '@/types/trainerTrainee';
import { TrainingSplitAssignmentResponse } from '@/types/trainingSplitAssignment';
import { ApiError } from '@/utils/apiError';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface Props {
    activeTrainer?: TrainerTraineeResponse;
    proposedSplits?: TrainingSplitAssignmentResponse[];
    isLoading: boolean;
    error?: ApiError | null;
    onAcceptProposal: (proposalId: number) => void;
    onDenyProposal: (proposalId: number) => void;
}

export const ProposedTrainingSplitsSection = ({
    activeTrainer,
    proposedSplits,
    isLoading,
    error,
    onAcceptProposal,
    onDenyProposal,
}: Props) => {
    const t = useTranslations(
        TRANSLATION_SECTION_KEYS.settingsPage + '.proposedSplits',
    );

    if (!activeTrainer) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>
                    {t('descriptionWithTrainer', {
                        firstName: activeTrainer.trainer.firstName,
                        lastName: activeTrainer.trainer.lastName,
                    })}
                </CardDescription>
            </CardHeader>
            {isLoading && (
                <CardContent className="flex justify-center items-center">
                    <Spinner />
                </CardContent>
            )}
            {error && (
                <CardContent className="text-red-500">
                    {t('errorLoading')} {error?.message}
                </CardContent>
            )}
            {proposedSplits && proposedSplits.length > 0 && !isLoading && (
                <CardContent>
                    <div className="space-y-3">
                        {proposedSplits.map((proposal) => (
                            <div
                                key={proposal.id}
                                className="rounded-lg border border-border bg-card p-4"
                            >
                                <div className="mb-3">
                                    <h3 className="font-semibold">
                                        {proposal.trainingSplit.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {proposal.trainingSplit.description}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() =>
                                            onAcceptProposal(proposal.id)
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
                                            onDenyProposal(proposal.id)
                                        }
                                        className="gap-1"
                                    >
                                        <X className="h-4 w-4" />
                                        {t('decline')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            )}
            {proposedSplits && proposedSplits.length === 0 && (
                <CardContent className="text-muted-foreground">
                    {t('noProposals')}
                </CardContent>
            )}
        </Card>
    );
};
