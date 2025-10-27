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
            isPublic: initialData.isPublic ?? false,
            isApproved: initialData.isApproved ?? false,
            exercises: initialData.exercises?.map((exercise) => ({
                id: exercise.id,
                exerciseId: exercise.exerciseId,
                sets: exercise.plannedRepsPerSet.map((reps) => ({
                    reps,
                })),
            })) || [],
        }
        : {
            name: '',
            description: '',
            isPublic: false,
            isApproved: false,
            exercises: [],
        };

    const form = useForm<WorkoutSessionPlanFormValues>({
        resolver: zodResolver(schema),
        defaultValues: computedDefaults,
    });

    return form;
}