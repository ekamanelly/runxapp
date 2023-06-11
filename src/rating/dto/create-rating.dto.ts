import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  Max,
  Min,
} from 'class-validator';
import { ActionCreator } from 'src/common/interface';

export class CreateRatingDto {
  @IsUUID()
  proposal_id: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  star: number;

  @IsOptional()
  @IsString()
  review: string;

  @IsEnum(ActionCreator)
  reviewer: ActionCreator;
}
