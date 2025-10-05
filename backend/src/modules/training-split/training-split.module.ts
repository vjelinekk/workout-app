import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingSplitEntity } from './entities/training-split.entity';
import { TrainingSplitAssignmentEntity } from './entities/training-split-assignment.entity';
import { TrainingSplitDayEntity } from './entities/training-split-day.entity';
import { TrainingSplitController } from './controllers/training-split.controller';
import { TrainingSplitDayController } from './controllers/training-split-day.controller';
import { TrainingSplitService } from './services/training-split.service';
import { TrainingSplitDayService } from './services/training-split-day.service';
import { TrainingSplitRepository } from './repositories/training-split.repository';
import { TrainingSplitDayRepository } from './repositories/training-split-day.repository';
import { WorkoutSessionPlanRepository } from '../workout/repositories/workout-session-plan.repository';
import { WorkoutSessionPlanEntity } from '../workout/entities/workout-session-plan.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TrainingSplitEntity,
            TrainingSplitAssignmentEntity,
            TrainingSplitDayEntity,
            WorkoutSessionPlanEntity,
        ]),
    ],
    controllers: [TrainingSplitController, TrainingSplitDayController],
    providers: [
        TrainingSplitService,
        TrainingSplitRepository,
        TrainingSplitDayService,
        TrainingSplitDayRepository,
        WorkoutSessionPlanRepository,
    ],
    exports: [],
})
export class TrainingSplitModule {}
