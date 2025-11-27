import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { PlansApprovalList } from '@/components/Approvals/PlansApprovalList';
import { UserRole } from '@/types/auth';

export default function PlansApprovalPage() {
    return (
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <PlansApprovalList />
        </ProtectedRoute>
    );
}
