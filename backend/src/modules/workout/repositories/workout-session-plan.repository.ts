import { BaseRepository } from 'src/common/repositories/base.repository';
import { WorkoutSessionPlanEntity } from '../entities/workout-session-plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class WorkoutSessionPlanRepository extends BaseRepository<WorkoutSessionPlanEntity> {
    constructor(
        @InjectRepository(WorkoutSessionPlanEntity)
        repo: Repository<WorkoutSessionPlanEntity>,
    ) {
        super(repo);
    }
}
