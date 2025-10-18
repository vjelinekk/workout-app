import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { CreateTrainingSplitForm } from '@/components/TrainingSplits/TrainingSplitForm/CreateTrainingSplitForm';

export default function CreateTrainingSplitPage() {
    return (
        <ProtectedRoute>
            <CreateTrainingSplitForm />
        </ProtectedRoute>
    );
}
