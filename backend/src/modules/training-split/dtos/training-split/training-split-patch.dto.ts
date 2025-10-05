import { PartialType } from "@nestjs/swagger";
import { TrainingSplitUpdateDto } from "./training-split-update.dto";

export class TrainingSplitPatchDto extends PartialType(TrainingSplitUpdateDto) {}