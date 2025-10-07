'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { UserRole } from '@/types/auth';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const isAdmin = useRole(UserRole.ADMIN);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Welcome back, {user?.firstName}!
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Email: {user?.email}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-xl font-semibold mb-2">
                                Your Profile
                            </h2>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">Name:</span>{' '}
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Nickname:
                                    </span>{' '}
                                    {user?.nickname}
                                </p>
                                <p>
                                    <span className="font-medium">Role:</span>{' '}
                                    {isAdmin ? 'Admin' : 'User'}
                                </p>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="rounded-lg bg-blue-50 p-6 shadow">
                                <h2 className="text-xl font-semibold mb-2">
                                    Admin Panel
                                </h2>
                                <p className="text-sm text-gray-600">
                                    You have admin access!
                                </p>
                                <button className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                    Manage Users
                                </button>
                            </div>
                        )}

                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-xl font-semibold mb-2">
                                Quick Actions
                            </h2>
                            <div className="space-y-2">
                                <button className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                                    Start Workout
                                </button>
                                <button className="w-full rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                                    View Exercises
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
