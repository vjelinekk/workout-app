import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { ApprovalsDashboard } from '@/components/Approvals/ApprovalsDashboard';
import { UserRole } from '@/types/auth';

export default function ApprovalsPage() {
    return (
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <ApprovalsDashboard />
        </ProtectedRoute>
    );
}
