import { RoleEnum } from '../../modules/user/enums/role.enum';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { RoleEntity } from '../../modules/user/entities/role.entity';

/**
 * Mock RoleEntity data for testing
 */
export const mockRoleAdmin: Partial<RoleEntity> = {
    id: RoleEnum.ADMIN,
    name: 'admin',
    description: 'Administrator role',
    users: [],
};

export const mockRoleTrainee: Partial<RoleEntity> = {
    id: RoleEnum.TRAINEE,
    name: 'trainee',
    description: 'Trainee role',
    users: [],
};

export const mockRoleTrainer: Partial<RoleEntity> = {
    id: RoleEnum.TRAINER,
    name: 'trainer',
    description: 'Trainer role',
    users: [],
};

/**
 * Mock UserEntity data for testing
 */
export const mockUserEntity: Partial<UserEntity> = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    nickname: 'testuser',
    password: '$2b$10$hashedPassword', // Example hashed password
    googleId: undefined,
    wantToBecomeTrainer: false,
    becomeTrainerReason: null,
    roles: [mockRoleTrainee as RoleEntity],
    isDeleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    trainingSplitAssignments: [],
    trainerTrainee: [],
};

export const mockTrainerUserEntity: Partial<UserEntity> = {
    id: 2,
    email: 'trainer@example.com',
    firstName: 'Trainer',
    lastName: 'User',
    nickname: 'traineruser',
    password: '$2b$10$hashedPassword',
    googleId: undefined,
    wantToBecomeTrainer: false,
    becomeTrainerReason: null,
    roles: [mockRoleTrainer as RoleEntity],
    isDeleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    trainingSplitAssignments: [],
    trainerTrainee: [],
};

export const mockAdminUserEntity: Partial<UserEntity> = {
    id: 3,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    nickname: 'adminuser',
    password: '$2b$10$hashedPassword',
    googleId: undefined,
    wantToBecomeTrainer: false,
    becomeTrainerReason: null,
    roles: [mockRoleAdmin as RoleEntity],
    isDeleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    trainingSplitAssignments: [],
    trainerTrainee: [],
};

export const mockGoogleUserEntity: Partial<UserEntity> = {
    id: 4,
    email: 'google@example.com',
    firstName: 'Google',
    lastName: 'User',
    nickname: 'googleuser',
    password: '$2b$10$hashedPassword',
    googleId: 'google-oauth-id-12345',
    wantToBecomeTrainer: false,
    becomeTrainerReason: null,
    roles: [mockRoleTrainee as RoleEntity],
    isDeleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    trainingSplitAssignments: [],
    trainerTrainee: [],
};

/**
 * Mock login response data for testing
 */
export const mockLoginResponse = {
    accessToken: 'mock-jwt-token-12345',
    userId: 1,
    userFirstName: 'Test',
    userLastName: 'User',
    userNickname: 'testuser',
    userEmail: 'test@example.com',
    roles: [RoleEnum.TRAINEE],
};

export const mockTrainerLoginResponse = {
    accessToken: 'mock-jwt-token-trainer',
    userId: 2,
    userFirstName: 'Trainer',
    userLastName: 'User',
    userNickname: 'traineruser',
    userEmail: 'trainer@example.com',
    roles: [RoleEnum.TRAINER],
};

export const mockAdminLoginResponse = {
    accessToken: 'mock-jwt-token-admin',
    userId: 3,
    userFirstName: 'Admin',
    userLastName: 'User',
    userNickname: 'adminuser',
    userEmail: 'admin@example.com',
    roles: [RoleEnum.ADMIN],
};

/**
 * Mock registration request data for testing
 */
export const mockRegisterRequestDto = {
    firstName: 'New',
    lastName: 'User',
    nickname: 'newuser',
    email: 'newuser@example.com',
    password: 'SecurePassword123!',
};

/**
 * Mock login request data for testing
 */
export const mockLoginRequestDto = {
    nickname: 'testuser',
    password: 'password123',
};

/**
 * Mock JWT payload data for testing
 */
export const mockJwtPayload = {
    sub: 1,
    nickname: 'testuser',
    roles: [RoleEnum.TRAINEE],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
};

/**
 * Helper function to create custom user entity for testing
 */
export const createMockUser = (
    overrides: Partial<UserEntity> = {},
): Partial<UserEntity> => ({
    ...mockUserEntity,
    ...overrides,
});

/**
 * Helper function to create custom role entity for testing
 */
export const createMockRole = (
    overrides: Partial<RoleEntity> = {},
): Partial<RoleEntity> => ({
    ...mockRoleTrainee,
    ...overrides,
});

/**
 * Mock WorkoutSessionPlanEntity data for testing
 */
export const mockWorkoutSessionPlanEntity = {
    id: 1,
    name: 'Upper Body Workout',
    description: 'A comprehensive upper body workout plan',
    isPublic: false,
    isApproved: false,
    createdById: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isDeleted: false,
    exercises: [],
};

/**
 * Mock WorkoutSessionPlanCreateDto data for testing
 */
export const mockWorkoutSessionPlanCreateDto = {
    name: 'New Workout Plan',
    description: 'A new comprehensive workout plan',
    isPublic: false,
};

/**
 * Mock WorkoutSessionPlanUpdateDto data for testing
 */
export const mockWorkoutSessionPlanUpdateDto = {
    name: 'Updated Workout Plan',
    description: 'Updated description',
    isPublic: true,
};

/**
 * Mock WorkoutSessionPlanResponseDto data for testing
 */
export const mockWorkoutSessionPlanResponseDto = {
    id: 1,
    name: 'Upper Body Workout',
    description: 'A comprehensive upper body workout plan',
    isPublic: false,
    isApproved: false,
};

/**
 * Mock WorkoutSessionPlanExerciseEntity data for testing
 */
export const mockWorkoutSessionPlanExerciseEntity = {
    id: 1,
    workoutSessionPlanId: 1,
    exerciseId: 1,
    plannedSets: 3,
    plannedRepsPerSet: [10, 10, 10],
    order: 1,
    createdById: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isDeleted: false,
};

/**
 * Mock WorkoutSessionPlanExerciseCreateDto data for testing
 */
export const mockWorkoutSessionPlanExerciseCreateDto = {
    workoutSessionPlanId: 1,
    exerciseId: 1,
    plannedSets: 3,
    plannedRepsPerSet: [10, 10, 10],
    order: 1,
};

/**
 * Mock WorkoutSessionPlanExerciseUpdateDto data for testing
 */
export const mockWorkoutSessionPlanExerciseUpdateDto = {
    exerciseId: 2,
    plannedSets: 4,
    plannedRepsPerSet: [12, 12, 12, 12],
    order: 2,
};

/**
 * Mock WorkoutSessionPlanExerciseResponseDto data for testing
 */
export const mockWorkoutSessionPlanExerciseResponseDto = {
    id: 1,
    workoutSessionPlanId: 1,
    exerciseId: 1,
    plannedSets: 3,
    plannedRepsPerSet: [10, 10, 10],
    order: 1,
};
