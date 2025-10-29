import { BadRequestException, HttpStatus } from '@nestjs/common';

export class TrainingSplitAlreadyPendingOrActiveException extends BadRequestException {
    constructor() {
        super({
            message:
                'The specified training split is already pending or active for the trainee',
            error: 'TRAINING_SPLIT_ALREADY_PENDING_OR_ACTIVE',
            statusCode: HttpStatus.BAD_REQUEST,
        });
    }
}
