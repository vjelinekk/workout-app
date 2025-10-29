import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { TrainerTraineeRepository } from '../repositories/trainer-trainee.repository';
import { JwtAuthenticatedUser } from 'src/modules/auth/types/jwt-authenticated-user.type';
import { RoleEnum } from '../enums/role.enum';
import { UserRepository } from '../repositories/user.repository';
import { TrainerTraineeStatusEnum } from '../enums/trainer-trainee-status.enum';
import { Not } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { TrainerTraineeResponseDto } from '../dtos/trainer-trainee-response.dto';
import { TrainingSplitAssignmentStatusEnum } from 'src/modules/training-split/enums/training-split-assignment-status.enum';
import { TrainerTraineeTraineeResponseDto } from '../dtos/trainer-trainee-trainee-response.dto';

@Injectable()
export class TrainerTraineeService {
    constructor(
        private readonly trainerTraineeRepository: TrainerTraineeRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async sendTrainerRequest(
        traineeId: number,
        user: JwtAuthenticatedUser,
    ): Promise<void> {
        if (traineeId === user.id) {
            throw new BadRequestException(
                'You cannot send a trainer request to yourself',
            );
        }

        const isAdminOrTrainer = user.roles.some(
            (role) =>
                (role as RoleEnum) === RoleEnum.ADMIN ||
                (role as RoleEnum) === RoleEnum.TRAINER,
        );

        if (!isAdminOrTrainer) {
            throw new UnauthorizedException(
                'Only trainers can send trainer requests',
            );
        }

        const trainee = await this.userRepository.findByIdActive(traineeId, {
            roles: true,
        });
        if (!trainee) {
            throw new BadRequestException('Trainee not found');
        }

        const isTrainee = trainee.roles.some(
            (role) => (role.id as RoleEnum) === RoleEnum.TRAINEE,
        );
        if (!isTrainee) {
            throw new BadRequestException(
                'The specified user is not a trainee',
            );
        }

        const existingRequest =
            await this.trainerTraineeRepository.findExistingRequest(
                traineeId,
                user.id,
            );
        if (existingRequest) {
            throw new BadRequestException('Trainer request already exists');
        }

        const trainerTrainee = this.trainerTraineeRepository.create({
            trainee: { id: traineeId },
            trainer: { id: user.id },
            assignedAt: new Date(),
        });

        await this.trainerTraineeRepository.save(trainerTrainee);
    }

    async getTrainerRequests(
        userId: number,
    ): Promise<TrainerTraineeResponseDto[]> {
        const requests = await this.trainerTraineeRepository.findActive({
            where: {
                trainee: { id: userId },
                status: Not(TrainerTraineeStatusEnum.REMOVED),
            },
            relations: {
                trainer: true,
            },
        });

        return requests.map((request) =>
            plainToInstance(TrainerTraineeResponseDto, request, {
                excludeExtraneousValues: true,
            }),
        );
    }

    async respondToTrainerRequest(
        accept: boolean,
        id: number,
        userId: number,
    ): Promise<void> {
        const request = await this.trainerTraineeRepository.findByIdActive(id, {
            trainee: true,
        });
        if (!request) {
            throw new BadRequestException('Trainer request not found');
        }

        if (request.trainee.id !== userId) {
            throw new UnauthorizedException(
                'You are not authorized to respond to this trainer request',
            );
        }

        if (request.status === TrainerTraineeStatusEnum.REMOVED) {
            throw new BadRequestException(
                'Trainer request has already been removed',
            );
        }

        if (accept) {
            request.status = TrainerTraineeStatusEnum.ACTIVE;
        } else {
            request.status = TrainerTraineeStatusEnum.REMOVED;
        }

        await this.trainerTraineeRepository.save(request);
    }

    async getTraineesForTrainer(
        id: number,
    ): Promise<TrainerTraineeTraineeResponseDto[]> {
        const trainees = await this.trainerTraineeRepository.findActive({
            where: {
                trainerId: id,
                status: TrainerTraineeStatusEnum.ACTIVE,
            },
            order: {
                trainee: {
                    trainingSplitAssignments: {
                        createdAt: 'DESC',
                    },
                },
            },
            relations: {
                trainee: {
                    trainingSplitAssignments: true,
                },
            },
        });

        return trainees.map((trainee) => ({
            id: trainee.trainee.id,
            firstName: trainee.trainee.firstName,
            lastName: trainee.trainee.lastName,
            email: trainee.trainee.email,
            activeTrainingSplitId:
                trainee.trainee.trainingSplitAssignments.find(
                    (assignment) =>
                        assignment.status ===
                        TrainingSplitAssignmentStatusEnum.ACTIVE,
                )?.trainingSplitId,
            pendingTrainingSplitIdList: trainee.trainee.trainingSplitAssignments
                .filter(
                    (assignment) =>
                        assignment.status ===
                        TrainingSplitAssignmentStatusEnum.PENDING,
                )
                .map((assignment) => assignment.trainingSplitId),
        }));
    }
}
