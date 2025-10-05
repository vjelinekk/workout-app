import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingSplitEntity } from './entities/training-split.entity';
import { TrainingSplitAssignmentEntity } from './entities/training-split-assignment.entity';
import { TrainingSplitDayEntity } from './entities/training-split-day.entity';
import { TrainingSplitController } from './controllers/training-split.controller';
import { TrainingSplitDayController } from './controllers/training-split-day.controller';
import { TrainingSplitAssignmentController } from './controllers/training-split-assignment.controller';
import { TrainingSplitService } from './services/training-split.service';
import { TrainingSplitDayService } from './services/training-split-day.service';
import { TrainingSplitAssignmentService } from './services/training-split-assignment.service';
import { TrainingSplitRepository } from './repositories/training-split.repository';
import { TrainingSplitDayRepository } from './repositories/training-split-day.repository';
import { TrainingSplitAssignmentRepository } from './repositories/training-split-assignment.repository';
import { WorkoutSessionPlanRepository } from '../workout/repositories/workout-session-plan.repository';
import { WorkoutSessionPlanEntity } from '../workout/entities/workout-session-plan.entity';
import { UserEntity } from '../user/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TrainingSplitEntity,
            TrainingSplitAssignmentEntity,
            TrainingSplitDayEntity,
            WorkoutSessionPlanEntity,
            UserEntity,
        ]),
    ],
    controllers: [
        TrainingSplitController,
        TrainingSplitDayController,
        TrainingSplitAssignmentController,
    ],
    providers: [
        TrainingSplitService,
        TrainingSplitRepository,
        TrainingSplitDayService,
        TrainingSplitDayRepository,
        TrainingSplitAssignmentService,
        TrainingSplitAssignmentRepository,
        WorkoutSessionPlanRepository,
    ],
    exports: [],
})
export class TrainingSplitModule {}
