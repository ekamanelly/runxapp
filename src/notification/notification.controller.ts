import { Notification } from 'src/entities/notification.entity';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { MarkNotificationDto } from './dto/mark-notification.dto';
import { ResponseMessage } from 'src/common/interface/success-message.interface';
import { PaginationResponse } from 'src/common/interface';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @CurrentUser() currentUser: User,
    @Query() paginationQueryDto: PaginationQueryDto,
  ): PaginationResponse<Notification> {
    return await this.notificationService.getNotifications(
      currentUser,
      paginationQueryDto,
    );
  }

  @Patch('mark-read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async markRead(
    @CurrentUser() currentUser: User,
    @Body() markNotificationDto: MarkNotificationDto,
  ): Promise<ResponseMessage> {
    return await this.notificationService.markNotification(
      currentUser,
      markNotificationDto,
    );
  }
}
