import { BaseRepository } from 'src/common/repositories/base.repository';
import { RoleEntity } from '../entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEnum } from '../enums/role.enum';

export class RoleRepository extends BaseRepository<RoleEntity> {
    constructor(
        @InjectRepository(RoleEntity)
        repo: Repository<RoleEntity>,
    ) {
        super(repo);
    }

    getDefaultRole(): Promise<RoleEntity | null> {
        return this.findOne({
            where: { id: RoleEnum.TRAINEE },
        });
    }
}
