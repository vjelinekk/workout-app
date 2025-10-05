import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingSplitEntity } from './entities/training-split.entity';
import { TrainingSplitAssignmentEntity } from './entities/training-split-assignment.entity';
import { TrainingSplitDayEntity } from './entities/training-split-day.entity';
import { TrainingSplitController } from './controllers/training-split.controller';
import { TrainingSplitService } from './services/training-split.service';
import { TrainingSplitRepository } from './repositories/training-split.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TrainingSplitEntity,
            TrainingSplitAssignmentEntity,
            TrainingSplitDayEntity,
        ]),
    ],
    controllers: [TrainingSplitController],
    providers: [TrainingSplitService, TrainingSplitRepository],
    exports: [],
})
export class TrainingSplitModule {}
