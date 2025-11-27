import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { PlanApprovalEdit } from '@/components/Approvals/PlanApprovalEdit';
import { UserRole } from '@/types/auth';

export default function PlanApprovalEditPage({
    params,
}: {
    params: { id: string };
}) {
    return (
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <PlanApprovalEdit id={Number(params.id)} />
        </ProtectedRoute>
    );
}
