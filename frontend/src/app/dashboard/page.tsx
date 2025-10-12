'use client';

import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { Dashboard } from '@/components/Dashboard/Dashboard';

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    );
}
