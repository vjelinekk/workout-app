import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { TrainerTraineeEntity } from './entities/trainer-trainee.entity';
import { MailModule } from '../mail/mail.module';
import { UserController } from './controllers/user.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            RoleEntity,
            TrainerTraineeEntity,
        ]),
        MailModule,
    ],
    controllers: [UserController],
    exports: [UserService, UserRepository, RoleRepository],
    providers: [UserService, UserRepository, RoleRepository],
})
export class UserModule {}
