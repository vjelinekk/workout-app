import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base.entity';
import { TrainingSplitEntity } from 'src/modules/training-split/entities/training-split.entity';
import { ExerciseEntity } from 'src/modules/exercise/entities/exercise.entity';
import { WorkoutSessionPlanEntity } from 'src/modules/workout/entities/workout-session-plan.entity';
import { WorkoutSessionEntity } from 'src/modules/workout/entities/workout-session.entity';
import { TrainerTraineeEntity } from './trainer-trainee.entity';
import { TrainingSplitAssignmentEntity } from 'src/modules/training-split/entities/training-split-assignment.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
    @Column({ name: 'google_id', unique: true, nullable: true })
    googleId?: string;

    @Column({
        name: 'first_name',
        unique: true,
        comment: 'First name of the user',
    })
    firstName: string;

    @Column({
        name: 'last_name',
        unique: true,
        comment: 'Last name of the user',
    })
    lastName: string;

    @Column({ unique: true, comment: 'Nickname of the user' })
    nickname: string;

    @Column({ unique: true, comment: 'Email address of the user' })
    email: string;

    @Exclude()
    @Column({ comment: 'Hashed password of the user' })
    password: string;

    // Relations

    @ManyToMany(() => RoleEntity, (role) => role.users)
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: RoleEntity[];
}
