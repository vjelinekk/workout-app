import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { TrainingSplitAssignmentEntity } from '../entities/training-split-assignment.entity';

@Injectable()
export class TrainingSplitAssignmentRepository extends BaseRepository<TrainingSplitAssignmentEntity> {
    constructor(
        @InjectRepository(TrainingSplitAssignmentEntity)
        repo: Repository<TrainingSplitAssignmentEntity>,
    ) {
        super(repo);
    }
}
