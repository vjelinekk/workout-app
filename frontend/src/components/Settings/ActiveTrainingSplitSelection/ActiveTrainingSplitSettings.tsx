'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCreateTrainingSplitAssignment } from '@/hooks/useTrainingSplitAssignments';
import {
    useTrainingSplitAssignedToUser,
    useTrainingSplits,
} from '@/hooks/useTrainingSplits';
import { Scope } from '@/types/scope';
import { ActiveTrainingSplitSection } from './ActiveTrainingSplitSection';

export const ActiveTrainingSplitSettings = () => {
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
        mutate: createTrainingSplitAssignment,
        error: createError,
        isPending: isCreating,
    } = useCreateTrainingSplitAssignment();

    const handleActiveSplitChange = (splitId: string) => {
        const splitIdAsNumber = Number(splitId);
        if (!user) return;

        createTrainingSplitAssignment({
            traineeId: user.id,
            trainingSplitId: splitIdAsNumber,
        });
    };

    return (
        <ActiveTrainingSplitSection
            activeSplit={assignedSplit}
            availableSplits={availableSplits}
            isLoadingAssigned={assignedSplitLoading}
            isLoadingAvailable={availableSplitsLoading}
            assignedError={assignedSplitError}
            availableError={availableSplitsError}
            createError={createError}
            isCreating={isCreating}
            onSplitChange={handleActiveSplitChange}
        />
    );
};
