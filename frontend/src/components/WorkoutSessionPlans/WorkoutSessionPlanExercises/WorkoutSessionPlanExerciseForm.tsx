'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
    Control,
    FieldError,
    FieldErrorsImpl,
    Merge,
    useFieldArray,
} from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { BasicInputField } from '@/components/BasicForm/BasicInputField';
import { BasicSelectBox } from '@/components/BasicForm/BasicSelectBox';
import { WorkoutSessionPlanFormValues } from '@/schemas/workoutSessionPlan';
import { Exercise } from '@/types/exercise';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { SelectItem } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    ChevronDown,
    ChevronUp,
    GripVertical,
    Trash2,
    Plus,
} from 'lucide-react';
import { BasicFormAlert } from '@/components/BasicForm/BasicFormAlert';

interface Props {
    control: Control<WorkoutSessionPlanFormValues>;
    exerciseIndex: number;
    exercises: Exercise[];
    planExercisesCount: number;
    isViewMode?: boolean;
    onRemove?: () => void;
    onMove?: (from: number, to: number) => void;
    error?: Merge<
        FieldError,
        FieldErrorsImpl<{
            exercise_id: number;
            sets: {
                reps: number;
            }[];
        }>
    >;
}

export const WorkoutSessionPlanExerciseForm = ({
    control,
    exerciseIndex,
    exercises,
    planExercisesCount,
    isViewMode,
    onRemove,
    onMove,
    error,
}: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.workoutSessionPlanForm);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [draggedOver, setDraggedOver] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const [showSetsError, setShowSetsError] = useState(false);

    const {
        fields: setsFields,
        append: appendSet,
        remove: removeSet,
    } = useFieldArray({
        control,
        name: `exercises.${exerciseIndex}.sets`,
    });

    useEffect(() => {
        const checkTouchDevice = () => {
            const hasCoarsePointer =
                window.matchMedia('(pointer: coarse)').matches;
            const hasTouchSupport =
                'ontouchstart' in window || navigator.maxTouchPoints > 0;
            setIsTouchDevice(hasCoarsePointer || hasTouchSupport);
        };
        checkTouchDevice();
        const mediaQuery = window.matchMedia('(pointer: coarse)');
        const handler = () => checkTouchDevice();
        if (mediaQuery.addEventListener)
            mediaQuery.addEventListener('change', handler);
        else mediaQuery.addListener(handler);
        return () => {
            if (mediaQuery.removeEventListener)
                mediaQuery.removeEventListener('change', handler);
            else mediaQuery.removeListener(handler);
        };
    }, []);

    useEffect(() => {
        if (!error?.sets?.root) {
            setShowSetsError(false);
            return;
        }

        setShowSetsError(true);
    }, [error]);

    const addSet = () => {
        setShowSetsError(false);
        appendSet({ reps: 1 });
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('exerciseIndex', exerciseIndex.toString());
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDraggedOver(true);
    };

    const handleDragLeave = () => {
        setDraggedOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDraggedOver(false);
        const sourceIndex = parseInt(
            e.dataTransfer.getData('exerciseIndex'),
            10,
        );
        if (sourceIndex !== exerciseIndex && onMove) {
            onMove(sourceIndex, exerciseIndex);
        }
    };

    const handleMoveUp = () => {
        if (exerciseIndex > 0 && onMove) {
            setIsMoving(true);
            onMove(exerciseIndex, exerciseIndex - 1);
            // Trigger haptic feedback on touch devices
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
            // Scroll to the new position after a short delay to allow DOM to update
            setTimeout(() => {
                cardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 100);
            // Reset the moving state after animation
            setTimeout(() => setIsMoving(false), 600);
        }
    };

    const handleMoveDown = () => {
        if (exerciseIndex < planExercisesCount - 1 && onMove) {
            setIsMoving(true);
            onMove(exerciseIndex, exerciseIndex + 1);
            // Trigger haptic feedback on touch devices
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
            // Scroll to the new position after a short delay to allow DOM to update
            setTimeout(() => {
                cardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 100);
            // Reset the moving state after animation
            setTimeout(() => setIsMoving(false), 600);
        }
    };

    return (
        <Card
            ref={cardRef}
            draggable={!isViewMode && !isTouchDevice}
            onDragStart={
                !isViewMode && !isTouchDevice ? handleDragStart : undefined
            }
            onDragOver={
                !isViewMode && !isTouchDevice ? handleDragOver : undefined
            }
            onDragLeave={
                !isViewMode && !isTouchDevice ? handleDragLeave : undefined
            }
            onDrop={!isViewMode && !isTouchDevice ? handleDrop : undefined}
            className={cn(
                'overflow-hidden transition-all duration-200 hover:shadow-md rounded-lg border-2',
                'p-2',
                !isViewMode && !isTouchDevice && 'cursor-move',
                draggedOver &&
                    !isTouchDevice &&
                    'border-primary ring-2 ring-primary/20 bg-primary/5',
                isMoving &&
                    'animate-pulse-scale border-primary ring-2 ring-primary/30 bg-primary/10',
            )}
        >
            {/* Title */}
            <div className="px-2 py-1 mb-1 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-foreground">
                    Exercise #{exerciseIndex + 1}
                </h2>
                {!isViewMode && planExercisesCount > 1 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={onRemove}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        aria-label={t('removeExercise')}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Header */}
            <div className="px-2 py-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {!isViewMode && !isTouchDevice && (
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing flex-shrink-0" />
                    )}

                    {!isViewMode && isTouchDevice && (
                        <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    'p-0.5 text-muted-foreground hover:text-foreground transition-all',
                                    'hover:bg-blue-100 dark:hover:bg-blue-900',
                                    'active:scale-90 active:bg-blue-200 dark:active:bg-blue-800',
                                    exerciseIndex === 0 &&
                                        'opacity-50 cursor-not-allowed',
                                )}
                                onClick={handleMoveUp}
                                disabled={exerciseIndex === 0}
                                aria-label="Move exercise up"
                            >
                                <ChevronUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    'p-0.5 text-muted-foreground hover:text-foreground transition-all',
                                    'hover:bg-blue-100 dark:hover:bg-blue-900',
                                    'active:scale-90 active:bg-blue-200 dark:active:bg-blue-800',
                                    exerciseIndex === planExercisesCount - 1 &&
                                        'opacity-50 cursor-not-allowed',
                                )}
                                onClick={handleMoveDown}
                                disabled={
                                    exerciseIndex === planExercisesCount - 1
                                }
                                aria-label="Move exercise down"
                            >
                                <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}

                    <BasicSelectBox
                        name={`exercises.${exerciseIndex}.exercise_id`}
                        control={control}
                        label={t('exercise')}
                        placeholder={t('placeholder.exercise')}
                        disabled={isViewMode}
                        valueType="number"
                        required
                        containerClassName="flex-1"
                    >
                        {exercises.map((exercise) => (
                            <SelectItem
                                key={exercise.id}
                                value={exercise.id.toString()}
                            >
                                {exercise.name}
                            </SelectItem>
                        ))}
                    </BasicSelectBox>
                </div>
            </div>

            <Separator />

            {/* Sets Section */}
            <div className="px-2 py-2 space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs">{t('sets')}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                        {setsFields.length}
                    </span>
                </div>

                {showSetsError && (
                    <BasicFormAlert
                        title={t(
                            'validation.eachExerciseHasToHaveAtLeastOneSet',
                        )}
                        show={showSetsError}
                        autoDismiss={false}
                        dismissCallback={() => setShowSetsError(false)}
                    />
                )}

                {setsFields.length > 0 && (
                    <div className="space-y-1.5">
                        {setsFields.map((set, setIndex) => (
                            <div
                                key={set.id}
                                className="flex gap-2 items-end p-1.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
                            >
                                <BasicInputField
                                    name={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}
                                    type="number"
                                    control={control}
                                    label={`${t('set')} ${setIndex + 1}`}
                                    disabled={isViewMode}
                                    min={1}
                                    max={100}
                                    required
                                    layout="horizontal"
                                />
                                {!isViewMode && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSet(setIndex)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {!isViewMode && (
                    <Button
                        type="button"
                        onClick={addSet}
                        variant="secondary"
                        size="sm"
                        className="w-full gap-1.5 justify-center py-1 h-8"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {t('addSet')}
                    </Button>
                )}
            </div>
        </Card>
    );
};
