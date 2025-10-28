import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { BecomeTrainer } from '@/components/BecomeTrainer/BecomeTrainer';
import { UserRole } from '@/types/auth';

export default function BecomeTrainerPage() {
    return (
        <ProtectedRoute requiredRoles={[UserRole.TRAINEE]}>
            <BecomeTrainer />
        </ProtectedRoute>
    );
}
