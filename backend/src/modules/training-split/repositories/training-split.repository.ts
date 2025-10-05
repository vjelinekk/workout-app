import { Injectable } from "@nestjs/common";
import { PublicAuthorizableBaseRepository } from "src/common/repositories/public-authorizable-base.repository";
import { TrainingSplitEntity } from "../entities/training-split.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class TrainingSplitRepository extends PublicAuthorizableBaseRepository<TrainingSplitEntity> {
    constructor(
        @InjectRepository(TrainingSplitEntity)
        repo: Repository<TrainingSplitEntity>,
    ) {
        super(repo);
    }
}