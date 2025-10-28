import { HttpStatus, NotFoundException } from '@nestjs/common';

export class NoAssignedTrainingSplitException extends NotFoundException {
    constructor() {
        super({
            message: 'No training split assigned to the user',
            error: 'NO_ASSIGNED_TRAINING_SPLIT',
            statusCode: HttpStatus.NOT_FOUND,
        });
    }
}
