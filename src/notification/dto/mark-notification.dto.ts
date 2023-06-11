import { IsArray, IsBoolean, IsUUID } from 'class-validator';

export class MarkNotificationDto {
  @IsArray()
  //   @IsUUID('all')
  ids: string[];

  @IsBoolean()
  is_read: boolean;
}
