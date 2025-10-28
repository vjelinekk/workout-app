import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { TrainerApprovals } from '@/components/TrainerApprovals/TrainerApprovals';
import { UserRole } from '@/types/auth';

export default function TrainerApprovalsPage() {
    return (
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <TrainerApprovals />
        </ProtectedRoute>
    );
}
