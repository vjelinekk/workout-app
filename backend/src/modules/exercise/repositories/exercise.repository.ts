import { PublicAuthorizableBaseRepository } from 'src/common/repositories/public-authorizable-base.repository';
import { ExerciseEntity } from '../entities/exercise.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExerciseRepository extends PublicAuthorizableBaseRepository<ExerciseEntity> {
    constructor(
        @InjectRepository(ExerciseEntity)
        repo: Repository<ExerciseEntity>,
    ) {
        super(repo);
    }
}
