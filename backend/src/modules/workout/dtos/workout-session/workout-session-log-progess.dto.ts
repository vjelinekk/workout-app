import { ApiProperty } from '@nestjs/swagger';
import {
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { WorkoutSessionSetProgressDto } from './workout-session-set-progress.dto';

@ValidatorConstraint({ name: 'IsValidProgressData', async: false })
class IsValidProgressDataConstraint implements ValidatorConstraintInterface {
    validate(value: unknown) {
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        // Validate structure: Record<number, Record<number, WorkoutSessionSetProgressDto>>
        const entries = Object.entries(value as Record<string, unknown>);
        for (const [exerciseId, sets] of entries) {
            // Check if exerciseId is numeric
            if (isNaN(Number(exerciseId))) {
                return false;
            }

            if (typeof sets !== 'object' || sets === null) {
                return false;
            }

            const setEntries = Object.entries(sets as Record<string, unknown>);
            for (const [setNum, setData] of setEntries) {
                // Check if setNum is numeric
                if (isNaN(Number(setNum))) {
                    return false;
                }

                // Validate setData against WorkoutSessionSetProgressDto
                const dto = plainToClass(
                    WorkoutSessionSetProgressDto,
                    setData as Record<string, unknown>,
                );
                const errors = validateSync(dto);

                if (errors.length > 0) {
                    return false;
                }
            }
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const value: unknown = args.value;

        if (typeof value !== 'object' || value === null) {
            return 'progressData must be an object';
        }

        const entries = Object.entries(value as Record<string, unknown>);
        for (const [exerciseId, sets] of entries) {
            if (isNaN(Number(exerciseId))) {
                return `Exercise ID "${exerciseId}" must be a number`;
            }

            if (typeof sets !== 'object' || sets === null) {
                return `Sets for exercise ${exerciseId} must be an object`;
            }

            const setEntries = Object.entries(sets as Record<string, unknown>);
            for (const [setNum, setData] of setEntries) {
                if (isNaN(Number(setNum))) {
                    return `Set number "${setNum}" must be a number`;
                }

                const dto = plainToClass(
                    WorkoutSessionSetProgressDto,
                    setData as Record<string, unknown>,
                );
                const errors = validateSync(dto);

                if (errors.length > 0) {
                    const firstError = errors[0];
                    const constraints = firstError.constraints;
                    const firstConstraintMessage = constraints
                        ? Object.values(constraints)[0]
                        : 'Invalid set data';
                    return `Exercise ${exerciseId}, Set ${setNum}: ${firstConstraintMessage}`;
                }
            }
        }

        return 'Invalid progress data';
    }
}

export class WorkoutSessionLogProgressDto {
    @ApiProperty({
        description: 'Progress data for the workout session',
        type: 'object',
        additionalProperties: {
            type: 'object',
            description: 'Exercise data indexed by exercise ID',
            additionalProperties: {
                type: 'object',
                description: 'Set data indexed by set number',
                properties: {
                    reps: {
                        type: 'number',
                        description: 'Number of repetitions',
                        minimum: 1,
                        example: 10,
                    },
                    weight: {
                        type: 'number',
                        description: 'Weight used (nullable)',
                        minimum: 0,
                        nullable: true,
                        example: 50,
                    },
                },
                required: ['reps'],
            },
        },
        example: {
            73: {
                1: { reps: 10, weight: 50 },
                2: { reps: 8, weight: 55 },
            },
        },
    })
    @Validate(IsValidProgressDataConstraint)
    progressData: Record<number, Record<number, WorkoutSessionSetProgressDto>>;
}
