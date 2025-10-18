import { Button } from '@/components/ui/button';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { WorkoutSessionPlanFormValues } from '@/schemas/workoutSessionPlan';
import { Exercise } from '@/types/exercise';
import { useTranslations } from 'next-intl';
import { Control, FieldErrors, useFieldArray } from 'react-hook-form';
import { WorkoutSessionPlanExerciseForm } from './WorkoutSessionPlanExerciseForm';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { BasicFormAlert } from '@/components/BasicForm/BasicFormAlert';
import { useEffect, useState } from 'react';

interface Props {
    control: Control<WorkoutSessionPlanFormValues>;
    exercises: Exercise[];
    errors?: FieldErrors<WorkoutSessionPlanFormValues>;
    isViewMode?: boolean;
}

export const WorkoutSessionPlanExercisesFormFields = ({
    control,
    exercises,
    errors,
    isViewMode,
}: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.workoutSessionPlanForm);
    const { fields, append, remove, move } = useFieldArray({
        control,
        name: 'exercises',
    });
    const [showNoExerciseError, setShowNoExerciseError] = useState(false);

    useEffect(() => {
        if (!errors?.exercises?.message) {
            setShowNoExerciseError(false);
            return;
        }

        setShowNoExerciseError(true);
    }, [errors]);

    const addExercise = () => {
        setShowNoExerciseError(false);
        append({ exercise_id: undefined, sets: [{ reps: 1 }] });
    };

    return (
        <div className="space-y-4">
            <Label className="text-base font-semibold">{t('exercises')}</Label>
            {showNoExerciseError && (
                <BasicFormAlert
                    title={t('validation.youHaveToAddAtLeastOneExercise')}
                    show={showNoExerciseError}
                    autoDismiss={false}
                    dismissCallback={() => setShowNoExerciseError(false)}
                />
            )}
            {fields.length === 0 && (
                <Card className="p-6 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                        {t('noExercisesAdded')}
                    </p>
                </Card>
            )}
            <div className="space-y-3 transition-all duration-300">
                {fields.length > 0 &&
                    fields.map((field, index, array) => {
                        return (
                            <div
                                key={field.id}
                                className="transition-all duration-300 ease-in-out"
                            >
                                <WorkoutSessionPlanExerciseForm
                                    control={control}
                                    exerciseIndex={index}
                                    exercises={exercises}
                                    planExercisesCount={array.length}
                                    isViewMode={isViewMode}
                                    onRemove={() => remove(index)}
                                    onMove={(from, to) => move(from, to)}
                                    error={errors?.exercises?.[index]}
                                />
                            </div>
                        );
                    })}
            </div>
            {!isViewMode && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={addExercise}
                    className="w-full"
                >
                    <Plus className="h-4 w-4" /> {t('addExercise')}
                </Button>
            )}
        </div>
    );
};
