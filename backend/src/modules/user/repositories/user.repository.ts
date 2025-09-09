import { BaseRepository } from 'src/common/repositories/base.repository';
import { UserEntity } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
    constructor(
        @InjectRepository(UserEntity)
        repo: Repository<UserEntity>,
    ) {
        super(repo);
    }

    findByEmail(email: string): Promise<UserEntity | null> {
        return this.findOne({
            where: { email },
            relations: ['roles'],
        });
    }

    findByGoogleId(googleId: string): Promise<UserEntity | null> {
        return this.findOne({
            where: { googleId },
            relations: ['roles'],
        });
    }
}
