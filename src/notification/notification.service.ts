import { CatchErrorException } from 'src/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/entities/notification.entity';
import { User } from 'src/entities/user.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { NOTIFICATION_LIST_FIELDS } from './notification.constant';
import { MarkNotificationDto } from './dto/mark-notification.dto';
import { ResponseMessage } from 'src/common/interface/success-message.interface';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly noteRepo: Repository<Notification>,
  ) {}

  async sendNotification(notification: Partial<Notification>) {
    try {
      const __note = await this.noteRepo.create({
        ...notification,
        created_at: new Date(),
      });
      await this.noteRepo.save(__note);
      return;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async sendNotifications(notifications: Partial<Notification>[]) {
    try {
      const notes = await notifications.map((notification) => {
        return this.noteRepo.create({
          ...notification,
          created_at: new Date(),
        });
      });
      return await this.noteRepo.save(notes);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async markNotification(
    owner: User,
    markNotificationDto: MarkNotificationDto,
  ) {
    try {
      const { is_read, ids } = markNotificationDto;
      await this.noteRepo
        .createQueryBuilder()
        .update(Notification)
        .set({ is_read })
        .whereInIds(ids)
        .where('owner.id = :id', { id: owner.id })
        .execute();
      return new ResponseMessage(
        `Notification marked as ${is_read ? 'read' : 'not read'}`,
      );
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getNotifications(
    owner: User,
    notificationQueryDto: PaginationQueryDto,
  ) {
    try {
      const { page, limit } = notificationQueryDto;
      const queryBuilder = await this.noteRepo
        .createQueryBuilder('not')
        .leftJoinAndSelect('not.client', 'client')
        .leftJoinAndSelect('not.service_request', 'sr')
        .leftJoinAndSelect('sr.service_types', 'st')
        .leftJoinAndSelect('not.service_provider', 'sp')
        .leftJoinAndSelect('not.owner', 'owner')
        .where('owner.id = :id', { id: owner.id })
        .orderBy('not.created_at', 'DESC')
        .select(NOTIFICATION_LIST_FIELDS);

      return await paginate<Partial<Notification>>(queryBuilder, {
        page,
        limit,
      });
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }
}
