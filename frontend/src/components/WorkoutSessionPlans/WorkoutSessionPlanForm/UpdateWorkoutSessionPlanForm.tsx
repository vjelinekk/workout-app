'use client';

import { ProtectedRoute } from '../../Auth/ProtectedRoute';
import { Spinner } from '../../ui/icons/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircleIcon } from 'lucide-react';
import { Alert, AlertTitle } from '../../ui/alert';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useTranslations } from 'next-intl';
import { User, UserRole } from '@/types/auth';
import { WorkoutSessionPlanForm } from './WorkoutSessionPlanForm';
import { useWorkoutSessionPlan } from '@/hooks/useWorkoutSessionPlans';

interface Props {
    id: number;
}

// Inner component that mounts only when auth is ready — this prevents
// useExercise from firing before the auth token is restored on page reload.
const WorkoutSessionPlanLoader = ({
    id,
    user,
}: {
    id: number;
    user: User | null;
}) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.workoutSessionPlanForm);

    const {
        data: workoutSessionPlan,
        error,
        isLoading,
    } = useWorkoutSessionPlan(id);

    if (isLoading) return <Spinner />;

    if (error)
        return (
            <div className="mb-4">
                <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>{t('loadingExerciseFailed')}</AlertTitle>
                </Alert>
            </div>
        );

    if (
        workoutSessionPlan &&
        user &&
        workoutSessionPlan.is_approved &&
        workoutSessionPlan.is_public &&
        !user.roles.includes(UserRole.ADMIN)
    ) {
        return (
            <WorkoutSessionPlanForm
                mode="view"
                id={id}
                initialData={workoutSessionPlan}
            />
        );
    }

    return (
        <WorkoutSessionPlanForm
            mode="edit"
            id={id}
            initialData={workoutSessionPlan}
        />
    );
};

export const UpdateWorkoutSessionPlanForm = ({ id }: Props) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    // While auth is initializing, show spinner (ProtectedRoute also handles redirects)
    if (isLoading) return <Spinner />;

    return (
        <ProtectedRoute>
            {isAuthenticated ? (
                <WorkoutSessionPlanLoader id={id} user={user} />
            ) : null}
        </ProtectedRoute>
    );
};
