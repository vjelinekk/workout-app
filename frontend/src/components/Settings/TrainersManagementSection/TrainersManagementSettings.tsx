'use client';

import {
    useRespondToTrainerRequest,
    useTrainerTrainees,
} from '@/hooks/useTrainerTrainees';
import { TrainersManagementSection } from './TrainersManagementSection';

export const TrainersManagementSettings = () => {
    const {
        data: trainers,
        error: trainersError,
        isLoading: trainersLoading,
    } = useTrainerTrainees();
    const { mutate: respondToTrainerRequest } = useRespondToTrainerRequest();

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

    return (
        <TrainersManagementSection
            trainers={trainers}
            isLoading={trainersLoading}
            error={trainersError}
            onAcceptTrainer={handleAcceptTrainer}
            onDenyTrainer={handleDenyTrainer}
        />
    );
};
