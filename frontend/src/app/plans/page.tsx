import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { WorkoutSessionPlans } from '@/components/WorkoutSessionPlans/WorkoutSessionPlans';

export default function ExercisesPage() {
    return (
        <ProtectedRoute>
            <WorkoutSessionPlans />
        </ProtectedRoute>
    );
}
