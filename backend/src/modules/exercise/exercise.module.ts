import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExerciseEntity } from "./entities/exercise.entity";
import { ExerciseCategoryEntity } from "./entities/exercise-category.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ExerciseEntity, ExerciseCategoryEntity])],
    controllers: [],
    exports: [],
    providers: [],
})
export class ExerciseModule {}