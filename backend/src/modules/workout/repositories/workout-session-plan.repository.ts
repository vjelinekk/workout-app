import { PublicAuthorizableBaseRepository } from 'src/common/repositories/public-authorizable-base.repository';
import { WorkoutSessionPlanEntity } from '../entities/workout-session-plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkoutSessionPlanRepository extends PublicAuthorizableBaseRepository<WorkoutSessionPlanEntity> {
    constructor(
        @InjectRepository(WorkoutSessionPlanEntity)
        repo: Repository<WorkoutSessionPlanEntity>,
    ) {
        super(repo);
    }
}
