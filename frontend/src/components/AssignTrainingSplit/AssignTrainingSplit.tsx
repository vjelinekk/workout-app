'use client';

import { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { User } from 'lucide-react';
import { useTrainingSplits } from '@/hooks/useTrainingSplits';
import { Scope } from '@/types/scope';
import { Spinner } from '../ui/icons/spinner';
import { useTrainees } from '@/hooks/useTrainerTrainees';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useCreateTrainingSplitAssignment } from '@/hooks/useTrainingSplitAssignments';

export const AssignTrainingSplit = () => {
    const {
        data: availableSplits,
        isLoading: availableSplitsLoading,
        error: availableSplitsError,
    } = useTrainingSplits(Scope.AVAILABLE);
    const {
        data: trainees,
        isLoading: traineesLoading,
        error: traineesError,
    } = useTrainees();
    const { mutate: createTrainingSplitAssignment, error: createError } =
        useCreateTrainingSplitAssignment();

    const [assignedCount, setAssignedCount] = useState(0);

    useEffect(() => {
        if (trainees) {
            const count = trainees.filter(
                (trainee) => trainee.activeTrainingSplitId !== undefined,
            ).length;
            setAssignedCount(count);
        }
    }, [trainees]);

    const handleSplitChange = (userId: number, splitId: number) => {
        createTrainingSplitAssignment({
            traineeId: userId,
            trainingSplitId: splitId,
        });
    };

    if (availableSplitsLoading) {
        return (
            <div className="flex justify-center items-center">
                <Spinner />
            </div>
        );
    }

    if (availableSplitsError) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error loading training splits</AlertTitle>
                <AlertDescription>
                    {availableSplitsError?.message || 'Unknown error'}
                </AlertDescription>
            </Alert>
        );
    }

    if (traineesLoading) {
        return (
            <div className="flex justify-center items-center">
                <Spinner />
            </div>
        );
    }

    if (traineesError) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error loading trainees</AlertTitle>
                <AlertDescription>
                    {traineesError.message || 'Unknown error'}
                </AlertDescription>
            </Alert>
        );
    }

    if (trainees?.length === 0) {
        return (
            <div className="min-h-screen bg-background p-4 md:p-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                        No Trainees Found
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        You currently have no trainees to assign training splits
                        to.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                        Assign Training Splits
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Select a training split for each trainee
                    </p>
                </div>

                {/* User List */}
                <div className="space-y-3">
                    {trainees?.map((trainee) => {
                        const hasActiveTrainingSplit =
                            trainee.activeTrainingSplitId !== undefined;
                        const statusLabel = hasActiveTrainingSplit
                            ? 'Active'
                            : 'Not Assigned';
                        const statusColor = hasActiveTrainingSplit
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800';

                        return (
                            <div
                                key={trainee.id}
                                className="flex flex-col items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted"
                            >
                                {createError && (
                                    <Alert
                                        variant="destructive"
                                        className="w-full mb-2"
                                    >
                                        <AlertTitle>
                                            Error assigning training split
                                        </AlertTitle>
                                        <AlertDescription>
                                            {createError?.message ||
                                                'Unknown error'}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* User Info */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <User className="h-8 w-8 text-foreground" />
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate font-medium text-card-foreground text-sm md:text-base">
                                            {trainee.firstName}{' '}
                                            {trainee.lastName}
                                        </p>
                                        <span
                                            className={`inline-block text-xs font-semibold px-2 py-1 rounded mt-1 ${statusColor}`}
                                        >
                                            {statusLabel}
                                        </span>
                                    </div>
                                </div>

                                {/* Split Selector */}
                                <div className="w-full flex flex-col gap-2">
                                    <div className="text-sm text-muted-foreground">
                                        {trainee.activeTrainingSplitId !==
                                            undefined && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium">
                                                    Active split:
                                                </span>
                                                <span className="font-semibold text-foreground">
                                                    {availableSplits?.find(
                                                        (s) =>
                                                            s.id ===
                                                            trainee.activeTrainingSplitId,
                                                    )?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <Select
                                        value=""
                                        onValueChange={(value) =>
                                            handleSplitChange(
                                                trainee.id,
                                                Number(value),
                                            )
                                        }
                                    >
                                        <SelectTrigger className="bg-background w-full">
                                            <SelectValue placeholder="Select split" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSplits?.map((split) => {
                                                const isActive =
                                                    split.id ===
                                                    trainee.activeTrainingSplitId;
                                                const isPending =
                                                    trainee.pendingTrainingSplitIdList?.includes(
                                                        split.id,
                                                    );
                                                const isDisabled =
                                                    isActive || isPending;
                                                return (
                                                    <SelectItem
                                                        key={split.id}
                                                        value={String(split.id)}
                                                        disabled={isDisabled}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            {split.name}
                                                            {isActive && (
                                                                <span className="text-xs font-semibold text-green-700">
                                                                    (Active)
                                                                </span>
                                                            )}
                                                            {isPending && (
                                                                <span className="text-xs font-semibold text-yellow-700">
                                                                    (Pending)
                                                                </span>
                                                            )}
                                                        </span>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                {assignedCount > 0 && (
                    <div className="mt-8 rounded-lg bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                {assignedCount}
                            </span>
                            {' of '}
                            <span className="font-semibold text-foreground">
                                {trainees?.length}
                            </span>
                            {' trainees assigned'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
