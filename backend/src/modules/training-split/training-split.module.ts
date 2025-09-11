import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TrainingSplitEntity } from "./entities/training-split.entity";
import { TrainingSplitAssignmentEntity } from "./entities/training-split-assignment.entity";
import { TrainingSplitDayEntity } from "./entities/training-split-day.entity";

@Module({
    imports: [TypeOrmModule.forFeature([TrainingSplitEntity, TrainingSplitAssignmentEntity, TrainingSplitDayEntity])],
    controllers: [],
    providers: [],
    exports: [],
})
export class TrainingSplitModule {}