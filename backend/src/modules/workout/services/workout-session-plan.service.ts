import { MappedCrudService } from 'src/common/services/mapped-crud.service';
import { WorkoutSessionPlanEntity } from '../entities/workout-session-plan.entity';
import { WorkoutSessionPlanCreateDto } from '../dtos/workout-session-plan/workout-session-plan-create.dto';
import { WorkoutSessionPlanUpdateDto } from '../dtos/workout-session-plan/workout-session-plan-update.dto';
import { WorkoutSessionPlanPatchDto } from '../dtos/workout-session-plan/workout-session-plan-patch.dto';
import { WorkoutSessionPlanResponseDto } from '../dtos/workout-session-plan/workout-session-plan-response.dto';
import { WorkoutSessionPlanRepository } from '../repositories/workout-session-plan.repository';
import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { FindAllScopes } from 'src/common/enums/find-all-scopes.enum';
import { RoleEnum } from 'src/modules/user/enums/role.enum';

@Injectable()
export class WorkoutSessionPlanService extends MappedCrudService<
    WorkoutSessionPlanEntity,
    WorkoutSessionPlanCreateDto,
    WorkoutSessionPlanUpdateDto,
    WorkoutSessionPlanPatchDto,
    WorkoutSessionPlanResponseDto,
    WorkoutSessionPlanRepository
> {
    constructor(
        protected readonly workoutSessionPlanRepository: WorkoutSessionPlanRepository,
    ) {
        super(workoutSessionPlanRepository);
    }

    protected toEntity(
        dto: WorkoutSessionPlanCreateDto,
        loggedInUserId?: number,
    ): DeepPartial<WorkoutSessionPlanEntity> {
        return {
            name: dto.name,
            description: dto.description,
            createdById: loggedInUserId,
        };
    }

    protected toResponseDto(
        entity: WorkoutSessionPlanEntity,
    ): WorkoutSessionPlanResponseDto {
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            is_public: entity.isPublic,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
            created_by: entity.createdById,
            is_approved: entity.isApproved,
        };
    }

    /**
     * Finds workout session plans based on the user's role and the specified scope.
     *
     * @param userId The ID of the user making the request
     * @param userRoles The roles of the user making the request
     * @param scope The scope of the request (e.g., ALL, AVAILABLE, MY, PUBLIC)
     * @param id Optional ID of a specific workout session plan to retrieve
     * @returns A list of workout session plans or a single workout session plan based on the scope and ID
     * @throws UnauthorizedException if the user does not have permission to access the requested data
     */
    private async findWorkoutSessionPlanByScope(
        userId: number,
        userRoles: RoleEnum[],
        scope: FindAllScopes,
        id?: number,
    ): Promise<WorkoutSessionPlanEntity[] | WorkoutSessionPlanEntity | null> {
        const isAdmin = userRoles.includes(RoleEnum.ADMIN);

        // Admin can access everything
        if (isAdmin) {
            return id ? await this.findOne(id) : await this.findAll();
        }

        // Non-admin trying to access ALL scope
        if (!isAdmin && scope === FindAllScopes.ALL) {
            throw new UnauthorizedException(
                'Only admins can access all workout session plans.',
            );
        }

        // Route to appropriate repository method
        switch (scope) {
            case FindAllScopes.AVAILABLE:
                return id
                    ? await this.repository.findOneAvailableToUser(userId, id)
                    : await this.repository.findAllAvailableToUser(userId);

            case FindAllScopes.MY:
                return id
                    ? await this.repository.findOneUserPrivate(userId, id)
                    : await this.repository.findAllUserPrivate(userId);

            case FindAllScopes.PUBLIC:
                return id
                    ? await this.repository.findOnePublicAndApproved(id)
                    : await this.repository.findAllPublicAndApproved();

            default:
                return id
                    ? await this.repository.findOneAvailableToUser(userId, id)
                    : await this.repository.findAllAvailableToUser(userId);
        }
    }

    /**
     * Finds all workout session plans available to the user based on their role and the specified scope.
     *
     * @param userId The ID of the user making the request
     * @param userRoles The roles of the user making the request
     * @param scope The scope of the request (e.g., ALL, AVAILABLE, MY, PUBLIC)
     * @returns A list of workout session plans based on the scope
     * @throws UnauthorizedException if the user does not have permission to access the requested data
     */
    async findAllAvailableForUser(
        userId: number,
        userRoles: RoleEnum[],
        scope: FindAllScopes,
    ): Promise<WorkoutSessionPlanResponseDto[]> {
        const entities = (await this.findWorkoutSessionPlanByScope(
            userId,
            userRoles,
            scope,
        )) as WorkoutSessionPlanEntity[];
        return entities.map((entity) => this.toResponseDto(entity));
    }

    /**
     * Finds a workout session plan based on the user's role, the specified scope, and the plan ID.
     *
     * @param userId The ID of the user making the request
     * @param userRoles The roles of the user making the request
     * @param scope The scope of the request (e.g., ALL, AVAILABLE, MY, PUBLIC)
     * @param id The ID of the workout session plan to retrieve
     * @returns The workout session plan as a response DTO
     * @throws NotFoundException if the workout session plan is not found or the user does not have permission to access it
     */
    async findOneAvailableForUser(
        userId: number,
        userRoles: RoleEnum[],
        scope: FindAllScopes,
        id: number,
    ): Promise<WorkoutSessionPlanResponseDto> {
        const entity = (await this.findWorkoutSessionPlanByScope(
            userId,
            userRoles,
            scope,
            id,
        )) as WorkoutSessionPlanEntity | null;

        if (!entity) {
            throw new NotFoundException('Workout session plan not found');
        }

        return this.toResponseDto(entity);
    }

    /**
     * Finds a workout session plan based on the user's role, the specified scope, and the plan ID.
     *
     * @param id The ID of the workout session plan to update
     * @param dto The data to update the workout session plan with
     * @param userId ID of the user making the request
     * @param userRoles Roles of the user making the request
     * @returns The updated workout session plan as a response DTO
     * @throws NotFoundException if the workout session plan is not found
     * @throws UnauthorizedException if the user does not have permission to update the workout session plan
     */
    async updateMappedForUser(
        id: number,
        dto: WorkoutSessionPlanUpdateDto | WorkoutSessionPlanPatchDto,
        userId: number,
        userRoles: RoleEnum[],
    ): Promise<WorkoutSessionPlanResponseDto> {
        const entity = await this.findOne(id);

        if (!entity) {
            throw new NotFoundException('Workout session plan not found');
        }

        const isAdmin = userRoles.includes(RoleEnum.ADMIN);
        const isOwner = entity.createdById === userId;

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException(
                'You do not have permission to update this workout session plan.',
            );
        }

        if (entity.isPublic && entity.isApproved) {
            throw new UnauthorizedException(
                'Cannot update an approved public workout session plan.',
            );
        }

        Object.assign(entity, dto);

        return this.updateMapped(id, dto);
    }

    /**
     * Finds a workout session plan based on the user's role, the specified scope, and the plan ID.
     *
     * @param id The ID of the workout session plan to delete
     * @param userId The ID of the user making the request
     * @param userRoles The roles of the user making the request
     * @returns The deleted workout session plan as a response DTO
     * @throws NotFoundException if the workout session plan is not found
     * @throws UnauthorizedException if the user does not have permission to delete the workout session plan
     */
    async deleteMappedForUser(
        id: number,
        userId: number,
        userRoles: RoleEnum[],
    ): Promise<WorkoutSessionPlanResponseDto> {
        const entity = await this.findOne(id);

        if (!entity) {
            throw new NotFoundException('Workout session plan not found');
        }

        const isAdmin = userRoles.includes(RoleEnum.ADMIN);
        const isOwner = entity.createdById === userId;

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException(
                'You do not have permission to delete this workout session plan.',
            );
        }

        if (entity.isPublic && entity.isApproved) {
            throw new UnauthorizedException(
                'Cannot delete an approved public workout session plan.',
            );
        }

        return this.deleteMapped(id);
    }

    /**
     * Restores a deleted workout session plan for a user.
     * 
     * @param id ID of the workout session plan to restore
     * @param userId ID of the user making the request
     * @param userRoles Roles of the user making the request
     * @returns The restored workout session plan as a response DTO
     * @throws NotFoundException if the workout session plan is not found
     * @throws UnauthorizedException if the user does not have permission to restore the workout session plan
     */
    async restoreMappedForUser(
        id: number,
        userId: number,
        userRoles: RoleEnum[],
    ): Promise<WorkoutSessionPlanResponseDto> {
        const entity = await this.findOne(id);

        if (!entity) {
            throw new NotFoundException('Workout session plan not found');
        }

        const isAdmin = userRoles.includes(RoleEnum.ADMIN);
        const isOwner = entity.createdById === userId;

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException(
                'You do not have permission to restore this workout session plan.',
            );
        }

        return await this.restoreMapped(id);
    }
}
