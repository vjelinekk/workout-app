import { BaseEntity } from 'src/common/entities/base.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ExerciseCategoryEntity } from './exercise-category.entity';
import { BodyPartEnum } from '../enums/body-part.enum';

@Entity('exercise')
export class ExerciseEntity extends BaseEntity {
    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    createdBy: UserEntity;

    @Column({ name: 'created_by', nullable: true })
    createdById: number;

    @ManyToOne(() => ExerciseCategoryEntity, (category) => category.exercises, {
        nullable: true,
    })
    @JoinColumn({ name: 'category_id' })
    category?: ExerciseCategoryEntity;

    @Column({ name: 'category_id', nullable: true })
    categoryId?: number;

    @Column({ comment: 'Name of the exercise' })
    name: string;

    @Column({
        name: 'body_part',
        type: 'enum',
        enum: BodyPartEnum,
        comment: 'Primary body part targeted by the exercise',
    })
    bodyPart: BodyPartEnum;

    @Column({ nullable: true, comment: 'Equipment needed for the exercise' })
    equipment: string;

    @Column({
        type: 'text',
        nullable: true,
        comment: 'Description of how to perform the exercise',
    })
    description: string;

    @Column({
        name: 'image_url',
        nullable: true,
        comment: 'URL to an image demonstrating the exercise',
    })
    imageUrl: string;

    @Column({
        name: 'is_public',
        default: false,
        comment: 'Whether the exercise is public (user wants to share it)',
    })
    isPublic: boolean;

    @Column({
        name: 'is_approved',
        default: false,
        comment: 'Whether the exercise is approved (visible to all users)',
    })
    isApproved: boolean;
}
