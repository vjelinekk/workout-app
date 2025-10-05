import { Column, Entity, OneToMany } from 'typeorm';
import { ExerciseEntity } from './exercise.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity('exercise_category')
export class ExerciseCategoryEntity extends AuditableEntity {
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
