import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { ExerciseApprovalEdit } from '@/components/Approvals/ExerciseApprovalEdit';
import { UserRole } from '@/types/auth';

export default function ExerciseApprovalEditPage({
    params,
}: {
    params: { id: string };
}) {
    return (
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <ExerciseApprovalEdit id={Number(params.id)} />
        </ProtectedRoute>
    );
}
