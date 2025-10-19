import { BaseRepository } from 'src/common/repositories/base.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutSessionExerciseEntity } from '../entities/workout-session-exercise.entity';

@Injectable()
export class WorkoutSessionExerciseRepository extends BaseRepository<WorkoutSessionExerciseEntity> {
    constructor(
        @InjectRepository(WorkoutSessionExerciseEntity)
        repo: Repository<WorkoutSessionExerciseEntity>,
    ) {
        super(repo);
    }
}
