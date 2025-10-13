import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { CreateExerciseForm } from '@/components/Exercises/ExerciseForm/CreateExerciseForm';

export default function CreateExercisePage() {
    return (
        <ProtectedRoute>
            <CreateExerciseForm />
        </ProtectedRoute>
    );
}
