'use client';

import { useTranslations } from 'next-intl';
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
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

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
    const t = useTranslations(TRANSLATION_SECTION_KEYS.settingsPage + '.activeTrainingSplit');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>
                    {t('description')}
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
                        {t('errorAssigned')} {assignedError?.message}
                    </CardContent>
                )}
            {isLoadingAvailable && (
                <CardContent className="flex justify-center items-center">
                    <Spinner />
                </CardContent>
            )}
            {availableError && (
                <CardContent className="text-red-500">
                    {t('errorAvailable')} {availableError?.message}
                </CardContent>
            )}
            {createError && (
                <CardContent className="text-red-500">
                    <BasicFormAlert
                        show={createError != null}
                        title={t('errorCreate')}
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
                            <SelectValue placeholder={t('selectPlaceholder')} />
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
