import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { UpdateExerciseForm } from '@/components/Exercises/ExerciseForm/UpdateExerciseForm';

interface Props {
    params: { id: number };
}

export default async function ExerciseDetailPage({ params }: Props) {
    /* eslint-disable-next-line @typescript-eslint/await-thenable */
    const id = (await params).id;

    return (
        <ProtectedRoute>
            <UpdateExerciseForm id={id} />
        </ProtectedRoute>
    );
}
