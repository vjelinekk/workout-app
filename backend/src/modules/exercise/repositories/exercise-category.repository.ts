import { BaseRepository } from 'src/common/repositories/base.repository';
import { ExerciseCategoryEntity } from '../entities/exercise-category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExerciseCategoryRepository extends BaseRepository<ExerciseCategoryEntity> {
    constructor(
        @InjectRepository(ExerciseCategoryEntity)
        repo: Repository<ExerciseCategoryEntity>,
    ) {
        super(repo);
    }
}
