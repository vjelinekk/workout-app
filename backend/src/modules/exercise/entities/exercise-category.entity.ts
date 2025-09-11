import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ExerciseEntity } from './exercise.entity';

@Entity('exercise_category')
export class ExerciseCategoryEntity extends BaseEntity {
    @Column({ comment: 'Name of the exercise category' })
    name: string;

    @Column({
        type: 'text',
        nullable: true,
        comment: 'Description of the exercise category',
    })
    description: string;

    @OneToMany(() => ExerciseEntity, (exercise) => exercise.category)
    exercises: ExerciseEntity[];
}
