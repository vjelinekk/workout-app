'use client';

import { Badge } from '@/components/ui/badge';
import { TrainerTraineeStatus } from '@/types/trainerTrainee';

interface StatusBadgeProps {
    status: TrainerTraineeStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    switch (status) {
        case TrainerTraineeStatus.ACTIVE:
            return (
                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20">
                    Active
                </Badge>
            );
        case TrainerTraineeStatus.PENDING:
            return (
                <Badge
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                >
                    Pending
                </Badge>
            );
    }
};
