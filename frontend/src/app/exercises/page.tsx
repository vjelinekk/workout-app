import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { Exercises } from '@/components/Exercises/Exercises';

export default function ExercisesPage() {
    return (
        <ProtectedRoute>
            <Exercises />
        </ProtectedRoute>
    );
}
