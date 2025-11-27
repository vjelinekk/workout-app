import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { ExercisesApprovalList } from '@/components/Approvals/ExercisesApprovalList';
import { UserRole } from '@/types/auth';

export default function ExercisesApprovalPage() {
    return (
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <ExercisesApprovalList />
        </ProtectedRoute>
    );
}
