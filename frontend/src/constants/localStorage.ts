const PREFIX = 'workout_app_'; // Namespace to avoid conflicts

export const LOCAL_STORAGE_KEYS = {
    authToken: `${PREFIX}auth_token`,
    authUser: `${PREFIX}auth_user`,
} as const;