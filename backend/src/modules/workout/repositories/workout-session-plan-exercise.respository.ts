import { BaseRepository } from 'src/common/repositories/base.repository';
import { WorkoutSessionPlanExerciseEntity } from '../entities/workout-session-plan-exercise.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WorkoutSessionPlanExerciseRepository extends BaseRepository<WorkoutSessionPlanExerciseEntity> {
    constructor(
        @InjectRepository(WorkoutSessionPlanExerciseEntity)
        repo: Repository<WorkoutSessionPlanExerciseEntity>,
    ) {
        super(repo);
    }
}
