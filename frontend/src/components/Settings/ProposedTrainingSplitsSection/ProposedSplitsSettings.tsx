'use client';

import {
    useResolveTrainingSplitAssignment,
    useTrainingSplitAssignments,
} from '@/hooks/useTrainingSplitAssignments';
import { TrainerTraineeResponse } from '@/types/trainerTrainee';
import { TrainingSplitAssignmentStatus } from '@/types/trainingSplitAssignment';
import { ProposedTrainingSplitsSection } from './ProposedTrainingSplitsSection';

interface Props {
    activeTrainer: TrainerTraineeResponse | undefined;
}

export const ProposedSplitsSettings = ({ activeTrainer }: Props) => {
    const {
        data: proposedSplits,
        isLoading: proposedSplitsLoading,
        error: proposedSplitsError,
    } = useTrainingSplitAssignments([TrainingSplitAssignmentStatus.PENDING]);
    const { mutate: resolveTrainingSplitAssignment } =
        useResolveTrainingSplitAssignment();

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
        <ProposedTrainingSplitsSection
            activeTrainer={activeTrainer}
            proposedSplits={proposedSplits}
            isLoading={proposedSplitsLoading}
            error={proposedSplitsError}
            onAcceptProposal={handleAcceptProposal}
            onDenyProposal={handleDenyProposal}
        />
    );
};
