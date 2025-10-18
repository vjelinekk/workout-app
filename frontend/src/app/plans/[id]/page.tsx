import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { UpdateWorkoutSessionPlanForm } from '@/components/WorkoutSessionPlans/WorkoutSessionPlanForm/UpdateWorkoutSessionPlanForm';

interface Props {
    params: { id: number };
}

export default async function WorkoutSessionPlanDetailPage({ params }: Props) {
    /* eslint-disable-next-line @typescript-eslint/await-thenable */
    const id = (await params).id;

    return (
        <ProtectedRoute>
            <UpdateWorkoutSessionPlanForm id={id} />
        </ProtectedRoute>
    );
}
