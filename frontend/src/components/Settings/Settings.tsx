'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTrainerTrainees } from '@/hooks/useTrainerTrainees';
import {
    TrainerTraineeResponse,
    TrainerTraineeStatus,
} from '@/types/trainerTrainee';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { ActiveTrainingSplitSettings } from './ActiveTrainingSplitSelection/ActiveTrainingSplitSettings';
import { TrainersManagementSettings } from './TrainersManagementSection/TrainersManagementSettings';
import { ProposedSplitsSettings } from './ProposedTrainingSplitsSection/ProposedSplitsSettings';

export const Settings = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.settingsPage);
    const { data: trainers } = useTrainerTrainees();
    const [activeTrainer, setActiveTrainer] = useState<
        TrainerTraineeResponse | undefined
    >(undefined);

    useEffect(() => {
        if (trainers) {
            const active = trainers.find(
                (trainer) => trainer.status === TrainerTraineeStatus.ACTIVE,
            );
            setActiveTrainer(active);
        }
    }, [trainers]);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('description')}
                    </p>
                </div>

                {/* Section 1: Active Training Split */}
                <ActiveTrainingSplitSettings />

                {/* Section 2: Trainers Management */}
                <TrainersManagementSettings />

                {/* Section 3: Proposed Training Splits */}
                <ProposedSplitsSettings activeTrainer={activeTrainer} />
            </div>
        </div>
    );
};
