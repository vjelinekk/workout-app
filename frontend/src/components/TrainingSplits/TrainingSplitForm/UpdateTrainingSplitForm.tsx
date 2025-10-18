'use client';

import { ProtectedRoute } from '../../Auth/ProtectedRoute';
import { Spinner } from '../../ui/icons/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircleIcon } from 'lucide-react';
import { Alert, AlertTitle } from '../../ui/alert';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useTranslations } from 'next-intl';
import { User, UserRole } from '@/types/auth';
import { useTrainingSplit } from '@/hooks/useTrainingSplits';
import { TrainingSplitForm } from './TrainingSplitForm';

interface Props {
    id: number;
}

// Inner component that mounts only when auth is ready — this prevents
// useTrainingSplit from firing before the auth token is restored on page reload.
const TrainingSplitLoader = ({
    id,
    user,
}: {
    id: number;
    user: User | null;
}) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.trainingSplitsForm);

    const { data: trainingSplit, error, isLoading } = useTrainingSplit(id);

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
        trainingSplit &&
        user &&
        trainingSplit.is_approved &&
        trainingSplit.is_public &&
        !user.roles.includes(UserRole.ADMIN)
    ) {
        return (
            <TrainingSplitForm
                mode="view"
                id={id}
                initialData={trainingSplit}
            />
        );
    }

    return (
        <TrainingSplitForm mode="edit" id={id} initialData={trainingSplit} />
    );
};

export const UpdateTrainingSplitForm = ({ id }: Props) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    // While auth is initializing, show spinner (ProtectedRoute also handles redirects)
    if (isLoading) return <Spinner />;

    return (
        <ProtectedRoute>
            {isAuthenticated ? (
                <TrainingSplitLoader id={id} user={user} />
            ) : null}
        </ProtectedRoute>
    );
};
