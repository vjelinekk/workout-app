'use client';

import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { TrainingSplitFormValues } from '@/schemas/trainingSplit';
import { WorkoutSessionPlan } from '@/types/workoutSessionPlan';
import { useTranslations } from 'next-intl';
import { Control, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { ChevronDown, Plus, Dumbbell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Props {
    control: Control<TrainingSplitFormValues>;
    workoutSessionPlans: WorkoutSessionPlan[];
    isViewMode?: boolean;
}

export const TrainingSplitDaysFormFields = ({
    control,
    workoutSessionPlans,
    isViewMode,
}: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.trainingSplitsForm);
    const DAYS_OF_WEEK = [
        { id: 1, name: t('days.monday'), shortName: t('days.mon') },
        { id: 2, name: t('days.tuesday'), shortName: t('days.tue') },
        { id: 3, name: t('days.wednesday'), shortName: t('days.wed') },
        { id: 4, name: t('days.thursday'), shortName: t('days.thu') },
        { id: 5, name: t('days.friday'), shortName: t('days.fri') },
        { id: 6, name: t('days.saturday'), shortName: t('days.sat') },
        { id: 7, name: t('days.sunday'), shortName: t('days.sun') },
    ];
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'training_split_days',
    });

    // Track which day is currently expanded (only one at a time)
    const [expandedDay, setExpandedDay] = useState<number | null>(null);

    // Track selected workout plan for each day when adding
    const [selectedPlanId, setSelectedPlanId] = useState<
        Record<number, string>
    >({});

    const toggleDay = (dayId: number) => {
        setExpandedDay(expandedDay === dayId ? null : dayId);
    };

    const handleSelectChange = (dayId: number, value: string) => {
        setSelectedPlanId((prev) => ({ ...prev, [dayId]: value }));
    };

    const addWorkoutToDay = (dayId: number) => {
        const planId = selectedPlanId[dayId];
        if (!planId) return;

        const plan = workoutSessionPlans.find((p) => p.id === parseInt(planId));
        if (!plan) return;

        append({
            workout_session_plan_id: plan.id,
            day_of_week: dayId,
        });

        setSelectedPlanId((prev) => ({ ...prev, [dayId]: '' }));
    };

    const removeWorkoutFromDay = (index: number) => remove(index);

    const getWorkoutsForDay = (dayId: number) =>
        fields
            .map((f, index) => ({ ...f, index }))
            .filter((w) => w.day_of_week === dayId);

    return (
        <div className="space-y-3">
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">
                    {t('weeklySchedule')}
                </h3>
            </div>

            {DAYS_OF_WEEK.map((day) => {
                const dayWorkouts = getWorkoutsForDay(day.id);
                const isExpanded = expandedDay === day.id;

                return (
                    <Card
                        key={day.id}
                        className={cn(
                            'overflow-hidden transition-all',
                            isExpanded && 'ring-2 ring-primary/20',
                        )}
                    >
                        {/* Day Header */}
                        <button
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold',
                                        dayWorkouts.length > 0
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {day.shortName}
                                </div>
                                <div className="text-left">
                                    <div className="font-medium">
                                        {day.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {dayWorkouts.length === 0 &&
                                            t('restDay')}
                                        {dayWorkouts.length === 1 &&
                                            t('oneWorkout')}
                                        {dayWorkouts.length > 1 &&
                                            `${dayWorkouts.length} ${t('workouts')}`}
                                    </div>
                                </div>
                            </div>
                            <ChevronDown
                                className={cn(
                                    'h-5 w-5 text-muted-foreground transition-transform',
                                    isExpanded && 'rotate-180',
                                )}
                            />
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="px-4 pb-4 space-y-3 border-t">
                                {/* Workout Sessions */}
                                <div className="space-y-2 pt-3">
                                    {dayWorkouts.length === 0 && (
                                        <div className="text-center py-6 text-sm text-muted-foreground">
                                            {t('noWorkoutsScheduled')}
                                        </div>
                                    )}

                                    {dayWorkouts.map((w) => {
                                        const plan = workoutSessionPlans.find(
                                            (p) =>
                                                p.id ===
                                                w.workout_session_plan_id,
                                        );
                                        if (!plan) return null;

                                        return (
                                            <div
                                                key={w.index}
                                                className="flex items-center gap-2 p-3 bg-accent/30 rounded-lg group"
                                            >
                                                <Dumbbell className="h-4 w-4 text-primary shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">
                                                        {plan.name}
                                                    </div>
                                                </div>
                                                {!isViewMode && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() =>
                                                            removeWorkoutFromDay(
                                                                w.index,
                                                            )
                                                        }
                                                        className="shrink-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Add Workout */}
                                {!isViewMode && (
                                    <div className="space-y-2">
                                        <Select
                                            value={selectedPlanId[day.id] || ''}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    day.id,
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={t(
                                                        'selectWorkoutPlan',
                                                    )}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {workoutSessionPlans.map(
                                                    (plan) => (
                                                        <SelectItem
                                                            key={plan.id}
                                                            value={plan.id.toString()}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Dumbbell className="h-3.5 w-3.5" />
                                                                <span>
                                                                    {plan.name}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() =>
                                                addWorkoutToDay(day.id)
                                            }
                                            disabled={!selectedPlanId[day.id]}
                                        >
                                            <Plus className="h-4 w-4" />{' '}
                                            {t('addWorkoutPlan')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                );
            })}

            {/* Summary */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        {t('totalWorkoutDays')}
                    </span>
                    <span className="font-semibold">
                        {
                            DAYS_OF_WEEK.filter(
                                (d) => getWorkoutsForDay(d.id).length > 0,
                            ).length
                        }{' '}
                        / 7
                    </span>
                </div>
            </div>
        </div>
    );
};
