import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { CreateWorkoutSessionPlanForm } from '@/components/WorkoutSessionPlans/WorkoutSessionPlanForm/CreateWorkoutSessionPlanForm';

export default function CreateWorkoutSessionPlanPage() {
    return (
        <ProtectedRoute>
            <CreateWorkoutSessionPlanForm />
        </ProtectedRoute>
    );
}
