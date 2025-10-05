import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { WorkoutSessionEntity } from '../entities/workout-session.entity';

@Injectable()
export class WorkoutSessionRepository extends BaseRepository<WorkoutSessionEntity> {
    constructor(
        @InjectRepository(WorkoutSessionEntity)
        repo: Repository<WorkoutSessionEntity>,
    ) {
        super(repo);
    }
}
