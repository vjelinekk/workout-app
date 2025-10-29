import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { RecruitTrainees } from '@/components/RecruitTrainees/RecruitTrainees';
import { UserRole } from '@/types/auth';

export default function RecruitTraineesPage() {
    return (
        <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.TRAINEE]}>
            <RecruitTrainees />
        </ProtectedRoute>
    );
}
