import { PartialType } from '@nestjs/swagger';
import { TrainingSplitDayUpdateDto } from './training-split-day-update.dto';

export class TrainingSplitDayPatchDto extends PartialType(
    TrainingSplitDayUpdateDto,
) {}
