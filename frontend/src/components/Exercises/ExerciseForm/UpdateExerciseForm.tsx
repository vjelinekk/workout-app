'use client';

import { useExercise } from '@/hooks/useExercises';
import { ProtectedRoute } from '../../Auth/ProtectedRoute';
import { ExerciseForm } from './ExerciseForm';
import { Spinner } from '../../ui/icons/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircleIcon } from 'lucide-react';
import { Alert, AlertTitle } from '../../ui/alert';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useTranslations } from 'next-intl';
import { User, UserRole } from '@/types/auth';

interface Props {
    id: number;
}

// Inner component that mounts only when auth is ready — this prevents
// useExercise from firing before the auth token is restored on page reload.
const ExerciseLoader = ({ id, user }: { id: number; user: User | null }) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.exerciseForm);

    const { data: exercise, error, isLoading } = useExercise(id);

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
        exercise &&
        user &&
        exercise.isApproved &&
        exercise.isPublic &&
        !user.roles.includes(UserRole.ADMIN)
    ) {
        return <ExerciseForm mode="view" id={id} initialData={exercise} />;
    }

    return <ExerciseForm mode="edit" id={id} initialData={exercise} />;
};

export const UpdateExerciseForm = ({ id }: Props) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    // While auth is initializing, show spinner (ProtectedRoute also handles redirects)
    if (isLoading) return <Spinner />;

    return (
        <ProtectedRoute>
            {isAuthenticated ? <ExerciseLoader id={id} user={user} /> : null}
        </ProtectedRoute>
    );
};
