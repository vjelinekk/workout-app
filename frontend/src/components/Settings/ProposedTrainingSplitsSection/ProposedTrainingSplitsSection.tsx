'use client';

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
    if (!activeTrainer) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Proposed Training Splits</CardTitle>
                <CardDescription>
                    Programs suggested by {activeTrainer.trainer.firstName}{' '}
                    {activeTrainer.trainer.lastName}
                </CardDescription>
            </CardHeader>
            {isLoading && (
                <CardContent className="flex justify-center items-center">
                    <Spinner />
                </CardContent>
            )}
            {error && (
                <CardContent className="text-red-500">
                    Error loading proposed training splits: {error?.message}
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
                                        Accept
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
                                        Decline
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            )}
            {proposedSplits && proposedSplits.length === 0 && (
                <CardContent className="text-muted-foreground">
                    No proposed training splits at the moment.
                </CardContent>
            )}
        </Card>
    );
};
