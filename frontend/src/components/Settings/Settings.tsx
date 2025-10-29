'use client';

import { useEffect, useState } from 'react';
import {
    useRespondToTrainerRequest,
    useTrainerTrainees,
} from '@/hooks/useTrainerTrainees';
import {
    TrainerTraineeResponse,
    TrainerTraineeStatus,
} from '@/types/trainerTrainee';
import {
    useCreateTrainingSplitAssignment,
    useResolveTrainingSplitAssignment,
    useTrainingSplitAssignments,
} from '@/hooks/useTrainingSplitAssignments';
import { TrainingSplitAssignmentStatus } from '@/types/trainingSplitAssignment';
import { useAuth } from '@/contexts/AuthContext';
import {
    useTrainingSplitAssignedToUser,
    useTrainingSplits,
} from '@/hooks/useTrainingSplits';
import { Scope } from '@/types/scope';
import { TrainingSplit } from '@/types/trainingSplit';
import { ActiveTrainingSplitSection } from './ActiveTrainingSplitSelection/ActiveTrainingSplitSection';
import { TrainersManagementSection } from './TrainersManagementSection/TrainersManagementSection';
import { ProposedTrainingSplitsSection } from './ProposedTrainingSplitsSection/ProposedTrainingSplitsSection';

export const Settings = () => {
    const { user } = useAuth();
    const {
        data: assignedSplit,
        isLoading: assignedSplitLoading,
        error: assignedSplitError,
    } = useTrainingSplitAssignedToUser();
    const {
        data: availableSplits,
        isLoading: availableSplitsLoading,
        error: availableSplitsError,
    } = useTrainingSplits(Scope.AVAILABLE);
    const {
        data: trainers,
        error: trainersError,
        isLoading: trainersLoading,
    } = useTrainerTrainees();
    const { mutate: respondToTrainerRequest } = useRespondToTrainerRequest();
    const {
        data: proposedSplits,
        isLoading: proposedSplitsLoading,
        error: proposedSplitsError,
    } = useTrainingSplitAssignments([TrainingSplitAssignmentStatus.PENDING]);
    const { mutate: resolveTrainingSplitAssignment } =
        useResolveTrainingSplitAssignment();
    const {
        mutate: createTrainingSplitAssignment,
        error: createError,
        isPending: isCreating,
    } = useCreateTrainingSplitAssignment();

    const [activeSplit, setActiveSplit] = useState<TrainingSplit | undefined>(
        undefined,
    );
    const [availableSplitsList, setAvailableSplitsList] = useState<
        TrainingSplit[] | undefined
    >(undefined);
    const [activeTrainer, setActiveTrainer] = useState<
        TrainerTraineeResponse | undefined
    >(undefined);

    useEffect(() => {
        if (assignedSplit) {
            setActiveSplit(assignedSplit);
        }
    }, [assignedSplit]);

    useEffect(() => {
        if (availableSplits) {
            setAvailableSplitsList(availableSplits);
        }
    }, [availableSplits]);

    useEffect(() => {
        if (trainers) {
            const active = trainers.find(
                (trainer) => trainer.status === TrainerTraineeStatus.ACTIVE,
            );
            setActiveTrainer(active);
        }
    }, [trainers]);

    const handleActiveSplitChange = (splitId: string) => {
        const splitIdAsNumber = Number(splitId);

        const selectedSplit = availableSplitsList?.find(
            (split) => split.id === splitIdAsNumber,
        );
        if (selectedSplit) {
            setActiveSplit(selectedSplit);
        }

        if (!user) return;

        createTrainingSplitAssignment({
            traineeId: user.id,
            trainingSplitId: splitIdAsNumber,
        });
    };

    const handleAcceptTrainer = (trainerId: number) => {
        respondToTrainerRequest({
            requestId: trainerId,
            accept: true,
        });
    };

    const handleDenyTrainer = (trainerId: number) => {
        respondToTrainerRequest({
            requestId: trainerId,
            accept: false,
        });
    };

    const handleAcceptProposal = (proposalId: number) => {
        resolveTrainingSplitAssignment({
            assignmentId: proposalId,
            accept: true,
        });
    };

    const handleDenyProposal = (proposalId: number) => {
        resolveTrainingSplitAssignment({
            assignmentId: proposalId,
            accept: false,
        });
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your training preferences and trainers
                    </p>
                </div>

                {/* Section 1: Active Training Split */}
                <ActiveTrainingSplitSection
                    activeSplit={activeSplit}
                    availableSplits={availableSplitsList}
                    isLoadingAssigned={assignedSplitLoading}
                    isLoadingAvailable={availableSplitsLoading}
                    assignedError={assignedSplitError}
                    availableError={availableSplitsError}
                    createError={createError}
                    isCreating={isCreating}
                    onSplitChange={handleActiveSplitChange}
                />

                {/* Section 2: Trainers Management */}
                <TrainersManagementSection
                    trainers={trainers}
                    isLoading={trainersLoading}
                    error={trainersError}
                    onAcceptTrainer={handleAcceptTrainer}
                    onDenyTrainer={handleDenyTrainer}
                />

                {/* Section 3: Proposed Training Splits */}
                <ProposedTrainingSplitsSection
                    activeTrainer={activeTrainer}
                    proposedSplits={proposedSplits}
                    isLoading={proposedSplitsLoading}
                    error={proposedSplitsError}
                    onAcceptProposal={handleAcceptProposal}
                    onDenyProposal={handleDenyProposal}
                />
            </div>
        </div>
    );
};
