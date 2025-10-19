import { Injectable } from '@nestjs/common';
import { PublicAuthorizableCrudService } from 'src/common/services/public-authorizable-crud.service';
import { TrainingSplitEntity } from '../entities/training-split.entity';
import { TrainingSplitCreateDto } from '../dtos/training-split/trainin-split-create.dto';
import { TrainingSplitUpdateDto } from '../dtos/training-split/training-split-update.dto';
import { TrainingSplitPatchDto } from '../dtos/training-split/training-split-patch.dto';
import { TrainingSplitResponseDto } from '../dtos/training-split/training-split-response.dto';
import { TrainingSplitRepository } from '../repositories/training-split.repository';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { DeepPartial } from 'typeorm';

@Injectable()
export class TrainingSplitService extends PublicAuthorizableCrudService<
    TrainingSplitEntity,
    TrainingSplitCreateDto,
    TrainingSplitUpdateDto,
    TrainingSplitPatchDto,
    TrainingSplitResponseDto,
    TrainingSplitRepository
> {
    constructor(
        protected readonly trainingSplitRepository: TrainingSplitRepository,
    ) {
        super(trainingSplitRepository);
    }

    protected get entityClass(): new () => TrainingSplitEntity {
        return TrainingSplitEntity;
    }
    protected get responseDtoClass(): new () => TrainingSplitResponseDto {
        return TrainingSplitResponseDto;
    }

    protected getEntityName(): string {
        return 'Training Split';
    }

    protected beforeCreate(
        dto: TrainingSplitCreateDto,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void dto;
        void user;
    }

    protected beforeUpdate(
        dto: TrainingSplitUpdateDto | TrainingSplitPatchDto,
        entity: TrainingSplitEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void dto;
        void entity;
        void user;
    }

    protected beforeDelete(
        entity: TrainingSplitEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void entity;
        void user;
    }

    protected beforeRestore(
        entity: TrainingSplitEntity,
        user: JwtAuthenticatedUser,
    ): Promise<void> | void {
        void entity;
        void user;
    }
}
