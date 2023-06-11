import { SpRating } from 'src/entities/sp-rating.entity';
import { User } from 'src/entities/user.entity';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';

@EventSubscriber()
export class AverageSpRatingSubscriber
  implements EntitySubscriberInterface<SpRating>
{
  listenTo() {
    return SpRating; // The entity to which the event subscriber listens
  }

  //   async afterInsert(event: InsertEvent<SpRating>) {
  //     const user = await User.createQueryBuilder('user')
  //       .loadRelationCountAndMap('user.sp_ratings', 'user.sp_ratings')
  //       .where('user.id = :id', { id: event.entity.user.id })
  //       .getOne();
  //     this.updateAverageSpRating(user);
  //   }

  //   async afterUpdate(event: UpdateEvent<SpRating>) {
  //     const user = await User.createQueryBuilder('user')
  //       .loadRelationCountAndMap('user.sp_ratings', 'user.sp_ratings')
  //       .where('user.id = :id', { id: event.entity.user.id })
  //       .getOne();
  //     this.updateAverageSpRating(user);
  //   }

  //   async afterRemove(event: RemoveEvent<SpRating>) {
  //     const user = await User.createQueryBuilder('user')
  //       .loadRelationCountAndMap('user.sp_ratings', 'user.sp_ratings')
  //       .where('user.id = :id', { id: event.entity.user.id })
  //       .getOne();
  //     this.updateAverageSpRating(user);
  //   }

  //   private async updateAverageSpRating(user: User) {
  //     const spRatingsCount = user.sp_ratings.length;
  //     const totalStars = (user.sp_ratings || []).reduce((prev, curr) => {
  //       return (prev += curr.star);
  //     }, 0);
  //     const spAverageRating = totalStars / spRatingsCount;
  //     console.log({ spAverageRating });
  //     user.sp_average_rating = spAverageRating;
  //     await user.save();
  //   }
}
