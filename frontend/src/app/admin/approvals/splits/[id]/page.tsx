import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { SplitApprovalEdit } from '@/components/Approvals/SplitApprovalEdit';
import { UserRole } from '@/types/auth';

export default function SplitApprovalEditPage({
    params,
}: {
    params: { id: string };
}) {
    return (
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <SplitApprovalEdit id={Number(params.id)} />
        </ProtectedRoute>
    );
}
