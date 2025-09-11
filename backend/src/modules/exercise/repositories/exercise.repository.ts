import { BaseRepository } from 'src/common/repositories/base.repository';
import { ExerciseEntity } from '../entities/exercise.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class ExerciseRepository extends BaseRepository<ExerciseEntity> {
    constructor(
        @InjectRepository(ExerciseEntity)
        repo: Repository<ExerciseEntity>,
    ) {
        super(repo);
    }
}
