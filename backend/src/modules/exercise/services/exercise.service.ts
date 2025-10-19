import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExerciseRepository } from '../repositories/exercise.repository';
import { ExerciseCreateDto } from '../dtos/exercise/exercise-create.dto';
import { ExerciseEntity } from '../entities/exercise.entity';
import { ExerciseResponseDto } from '../dtos/exercise/exercise-response.dto';
import { ExercisePatchDto } from '../dtos/exercise/exercise-patch.dto';
import { ExerciseUpdateDto } from '../dtos/exercise/exercise-update.dto';
import { PublicAuthorizableCrudService } from 'src/common/services/public-authorizable-crud.service';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { RoleEnum } from 'src/modules/user/enums/role.enum';

@Injectable()
export class ExerciseService extends PublicAuthorizableCrudService<
    ExerciseEntity,
    ExerciseCreateDto,
    ExerciseUpdateDto,
    ExercisePatchDto,
    ExerciseResponseDto,
    ExerciseRepository
> {
    constructor(protected readonly exerciseRepository: ExerciseRepository) {
        super(exerciseRepository);
    }

    protected getEntityName(): string {
        return 'Exercise';
    }

    protected get entityClass(): new () => ExerciseEntity {
        return ExerciseEntity;
    }
    protected get responseDtoClass(): new () => ExerciseResponseDto {
        return ExerciseResponseDto;
    }

    protected beforeCreate(
        dto: ExerciseCreateDto,
        user: JwtAuthenticatedUser,
    ): void {
        if (dto.isApproved && !user.roles.includes(RoleEnum.ADMIN)) {
            throw new UnauthorizedException(
                'Only admins can create approved exercises.',
            );
        }
    }

    protected beforeUpdate(
        dto: ExerciseUpdateDto | ExercisePatchDto,
        entity: ExerciseEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void dto;
        void entity;
        void user;
    }

    protected beforeDelete(
        entity: ExerciseEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void entity;
        void user;
    }

    protected beforeRestore(
        entity: ExerciseEntity,
        user: JwtAuthenticatedUser,
    ): void {
        void entity;
        void user;
    }
}
