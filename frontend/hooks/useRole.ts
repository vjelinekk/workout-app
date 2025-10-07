import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";

/**
 * Check if current user has a specific role
 */
export function useRole(requiredRole: UserRole): boolean {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return false;
    }

    return user.roles.includes(requiredRole);
}

/**
 * Check if user has ANY of the specified roles
 */
export function useAnyRole(roles: UserRole[]): boolean {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return false;
    }

    return roles.some(role => user.roles.includes(role));
}

/**
 * Check if user has ALL of the specified roles
 */
export function useAllRoles(roles: UserRole[]): boolean {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return false;
    }

    return roles.every(role => user.roles.includes(role));
}