import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserController } from './controllers/user.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity])],
    controllers: [UserController],
    exports: [UserService],
    providers: [UserService, UserRepository, RoleRepository],
})
export class UserModule {}
