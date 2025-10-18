
import { TRANSLATION_SECTION_KEYS } from "@/constants/locale";
import { WorkoutSessionPlanFormValues, workoutSessionPlanSchema } from "@/schemas/workoutSessionPlan";
import { WorkoutSessionPlan } from "@/types/workoutSessionPlan";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

export const useWorkoutSessionForm = (initialData?: WorkoutSessionPlan) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.workoutSessionPlanForm);

    const schema = workoutSessionPlanSchema(
        t('validation.nameRequired'),
        t('validation.descriptionRequired'),
        t('validation.oneExerciseRequired'),
        t('validation.exerciseRequired'),
        t('validation.repsRequired'),
        t('validation.oneSetRequired'),
    );

    const computedDefaults: WorkoutSessionPlanFormValues = initialData
        ? {
            name: initialData.name ?? '',
            description: initialData.description ?? '',
            is_public: initialData.is_public ?? false,
            is_approved: initialData.is_approved ?? false,
            exercises: initialData.exercises?.map((exercise) => ({
                id: exercise.id,
                exercise_id: exercise.exercise_id,
                sets: exercise.planned_reps_per_set.map((reps) => ({
                    reps,
                })),
            })) || [],
        }
        : {
            name: '',
            description: '',
            is_public: false,
            is_approved: false,
            exercises: [],
        };

    const form = useForm<WorkoutSessionPlanFormValues>({
        resolver: zodResolver(schema),
        defaultValues: computedDefaults,
    });

    return form;
}