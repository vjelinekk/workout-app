import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { TrainingSplitDayEntity } from '../entities/training-split-day.entity';

@Injectable()
export class TrainingSplitDayRepository extends BaseRepository<TrainingSplitDayEntity> {
    constructor(
        @InjectRepository(TrainingSplitDayEntity)
        repo: Repository<TrainingSplitDayEntity>,
    ) {
        super(repo);
    }
}
