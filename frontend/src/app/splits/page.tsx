import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { TrainingSplits } from '@/components/TrainingSplits/TrainingSplits';

export default function TrainingSplitsPage() {
    return (
        <ProtectedRoute>
            <TrainingSplits />
        </ProtectedRoute>
    );
}
