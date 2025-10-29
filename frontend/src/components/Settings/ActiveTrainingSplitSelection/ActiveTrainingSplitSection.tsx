'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/icons/spinner';
import { TRAINING_SPLIT_ERROR_CODES } from '@/constants/trainingSplit';
import { TrainingSplit } from '@/types/trainingSplit';
import { ApiError } from '@/utils/apiError';
import { BasicFormAlert } from '@/components/BasicForm/BasicFormAlert';

interface Props {
    activeSplit?: TrainingSplit;
    availableSplits?: TrainingSplit[];
    isLoadingAssigned: boolean;
    isLoadingAvailable: boolean;
    assignedError?: ApiError | null;
    availableError?: ApiError | null;
    createError?: ApiError | null;
    isCreating?: boolean;
    onSplitChange: (splitId: string) => void;
}

export const ActiveTrainingSplitSection = ({
    activeSplit,
    availableSplits,
    isLoadingAssigned,
    isLoadingAvailable,
    assignedError,
    availableError,
    createError,
    isCreating,
    onSplitChange,
}: Props) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Training Split</CardTitle>
                <CardDescription>
                    Select your current training program
                </CardDescription>
            </CardHeader>
            {isLoadingAssigned && (
                <CardContent className="flex justify-center items-center">
                    <Spinner />
                </CardContent>
            )}
            {assignedError &&
                assignedError?.errorCode !==
                    TRAINING_SPLIT_ERROR_CODES.noAssignedTrainingSplit && (
                    <CardContent className="text-red-500">
                        Error loading assigned training split:{' '}
                        {assignedError?.message}
                    </CardContent>
                )}
            {isLoadingAvailable && (
                <CardContent className="flex justify-center items-center">
                    <Spinner />
                </CardContent>
            )}
            {availableError && (
                <CardContent className="text-red-500">
                    Error loading available training splits:{' '}
                    {availableError?.message}
                </CardContent>
            )}
            {createError && (
                <CardContent className="text-red-500">
                    <BasicFormAlert
                        show={createError != null}
                        title="Error"
                        description={createError?.message}
                        autoDismiss={false}
                    />
                </CardContent>
            )}
            {availableSplits && !isLoadingAssigned && (
                <CardContent>
                    <Select
                        value={String(activeSplit?.id)}
                        onValueChange={onSplitChange}
                        disabled={isCreating}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a training split" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableSplits?.map((split) => (
                                <SelectItem
                                    key={split.id}
                                    value={String(split.id)}
                                >
                                    {split.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            )}
        </Card>
    );
};
