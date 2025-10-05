import { PartialType } from '@nestjs/swagger';
import { TrainingSplitAssignmentUpdateDto } from './training-split-assignment-update.dto';

export class TrainingSplitAssignmentPatchDto extends PartialType(
    TrainingSplitAssignmentUpdateDto,
) {}
