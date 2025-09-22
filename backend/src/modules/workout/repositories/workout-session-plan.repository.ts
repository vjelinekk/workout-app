import { BaseRepository } from 'src/common/repositories/base.repository';
import { WorkoutSessionPlanEntity } from '../entities/workout-session-plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkoutSessionPlanRepository extends BaseRepository<WorkoutSessionPlanEntity> {
    constructor(
        @InjectRepository(WorkoutSessionPlanEntity)
        repo: Repository<WorkoutSessionPlanEntity>,
    ) {
        super(repo);
    }

    async findAllUserPrivate(
        userId: number,
    ): Promise<WorkoutSessionPlanEntity[]> {
        return this.findActive({
            where: { createdById: userId },
        });
    }

    async findOneUserPrivate(
        userId: number,
        id: number,
    ): Promise<WorkoutSessionPlanEntity | null> {
        return this.findOneActive({
            where: { createdById: userId, id },
        });
    }

    async findAllAvailableToUser(
        userId: number,
    ): Promise<WorkoutSessionPlanEntity[]> {
        return this.findActive({
            where: [
                { isPublic: true, isApproved: true },
                { createdById: userId },
            ],
        });
    }

    async findOneAvailableToUser(
        userId: number,
        id: number,
    ): Promise<WorkoutSessionPlanEntity | null> {
        return this.findOneActive({
            where: [
                { isPublic: true, isApproved: true, id },
                { createdById: userId, id },
            ],
        });
    }

    findAllPublicAndApproved(): Promise<WorkoutSessionPlanEntity[]> {
        return this.findActive({
            where: { isPublic: true, isApproved: true },
        });
    }

    async findOnePublicAndApproved(
        id: number,
    ): Promise<WorkoutSessionPlanEntity | null> {
        return this.findOneActive({
            where: { isPublic: true, isApproved: true, id },
        });
    }
}
