import { BadRequestException, HttpStatus } from '@nestjs/common';

export class PlannedRepsSetsMismatchException extends BadRequestException {
    constructor(expectedSets: number, actualRepsLength: number) {
        super({
            message: `Planned reps per set array length (${actualRepsLength}) must match planned sets count (${expectedSets})`,
            error: 'PLANNED_REPS_SETS_MISMATCH',
            statusCode: HttpStatus.BAD_REQUEST,
            context: {
                expectedSets,
                actualRepsLength,
            },
        });
    }
}
