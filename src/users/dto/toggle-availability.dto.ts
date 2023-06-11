import { IsBoolean } from 'class-validator';

export class ToggleAvailabilityDto {
  @IsBoolean()
  is_avai: boolean;
}
