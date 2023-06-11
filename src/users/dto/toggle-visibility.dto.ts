import { IsBoolean } from 'class-validator';

export class ToggleVisibilityDto {
  @IsBoolean()
  is_online: boolean;
}
