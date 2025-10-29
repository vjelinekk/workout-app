import { BaseRepository } from 'src/common/repositories/base.repository';
import { TrainerTraineeEntity } from '../entities/trainer-trainee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class TrainerTraineeRepository extends BaseRepository<TrainerTraineeEntity> {
    constructor(
        @InjectRepository(TrainerTraineeEntity)
        protected repo: Repository<TrainerTraineeEntity>,
    ) {
        super(repo);
    }

    async findExistingRequest(
        traineeId: number,
        trainerId: number,
    ): Promise<TrainerTraineeEntity | null> {
        return this.repo.findOne({
            where: {
                trainee: { id: traineeId },
                trainer: { id: trainerId },
            },
        });
    }
}
