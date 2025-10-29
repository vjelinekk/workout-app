import { AssignTrainingSplit } from '@/components/AssignTrainingSplit/AssignTrainingSplit';
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { UserRole } from '@/types/auth';

export default function AssignTrainingSplitPage() {
    return (
        <ProtectedRoute requiredRoles={[UserRole.TRAINER, UserRole.ADMIN]}>
            <AssignTrainingSplit />
        </ProtectedRoute>
    );
}
