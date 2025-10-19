import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { TrainingSplitAssigned } from '@/components/SessionLogging/TrainingSplitAssigned';

export default function SessionLoggingPage() {
    return (
        <ProtectedRoute>
            <TrainingSplitAssigned />
        </ProtectedRoute>
    );
}
