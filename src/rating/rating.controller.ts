import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { UserRoles } from 'src/users/interfaces/user.interface';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/entities/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { GetRatingQueryDto } from './dto/get-rating-query.dto';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post('')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER, UserRoles.CLIENT)
  @HttpCode(200)
  async createRating(
    @Body() createRatingDto: CreateRatingDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.ratingService.createRating(currentUser, createRatingDto);
  }

  @Get('/client')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER, UserRoles.CLIENT)
  @HttpCode(200)
  async getSpRating(@Query() getRatingQueryDto: GetRatingQueryDto) {
    return await this.ratingService.getClientRatings(getRatingQueryDto);
  }

  @Get('/sp')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER, UserRoles.CLIENT)
  @HttpCode(200)
  async getClientRating(@Query() getRatingQueryDto: GetRatingQueryDto) {
    return await this.ratingService.getSpRatings(getRatingQueryDto);
  }
}
