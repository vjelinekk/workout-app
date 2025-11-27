import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { SplitsApprovalList } from '@/components/Approvals/SplitsApprovalList';
import { UserRole } from '@/types/auth';

export default function SplitsApprovalPage() {
    return (
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <SplitsApprovalList />
        </ProtectedRoute>
    );
}
