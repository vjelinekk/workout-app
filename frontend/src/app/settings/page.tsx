import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { Settings } from '@/components/Settings/Settings';

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <Settings />
        </ProtectedRoute>
    );
}
