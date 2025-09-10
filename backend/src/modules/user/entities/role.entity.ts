import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('role')
export class RoleEntity extends BaseEntity {
    @Column({ unique: true, comment: 'Role name, e.g., admin, user, etc.' })
    name: string;

    @Column({ nullable: true, comment: 'Description of the role' })
    description: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'created_by' })
    createdBy: UserEntity;

    @ManyToMany(() => UserEntity, (user) => user.roles)
    users: UserEntity[];
}
