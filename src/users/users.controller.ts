import { UserNotFoundException } from 'src/exceptions';
import { LoginUserDto } from './dto/login-user.dto';
import { MessagingService } from './../messaging/messaging.service';
import { VerificationCodeType } from './../verification-code/interfaces/verification-code.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerificationCodeService } from './../verification-code/verification-code.service';
import { Controller, HttpException, forwardRef } from '@nestjs/common';
import {
  Body,
  HttpCode,
  Post,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
  Query,
  Inject,
} from '@nestjs/common/decorators';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from './users.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { HttpStatus } from '@nestjs/common/enums';
import { PatchUserDto } from './dto/patch-user.dto';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { IdentifierType } from 'src/verification-code/interfaces/verification-code.interface';
import { SERVICE_EMAIL_EXPIRATION_TIME } from 'src/common/config/env.constant';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestPhoneVerificationDto } from './dto/request-phone-verification.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { Public } from 'src/common/public.common';
import { CreateTransactionPinDto } from './dto/create-transaction-pin.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/entities/user.entity';
import { ResetTransactionPinDto } from './dto/reset-transaction-pin.dto';
import { VerifyPhoneNumberDto } from './dto/verify-phone-number.dto';
import { forgotPasswordEmail } from 'src/common/email-template/forgot-password-email';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from './interfaces/user.interface';
import { ListUserQueryDto } from './dto/list-users-query.dto';
import { RoleGuard } from 'src/guards/role.guard';
import { PaginationResponse } from 'src/common/interface';
import { ToggleVisibilityDto } from './dto/toggle-visibility.dto';
import { ResponseMessage } from 'src/common/interface/success-message.interface';
import { ChangeTransactionPinDto } from './dto/change-transaction-pin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly messagingService: MessagingService,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(201)
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    const { verifyEmail } = await this.usersService.registerUser(
      registerUserDto,
    );
    return {
      message: `Registration successfull ${verifyEmail ? 'verify email' : ''}`,
      verifyEmail,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async loginUser(@Body() loginUserDto: LoginUserDto, @Request() req) {
    await this.usersService.toggleVisibility(req.user, { is_online: true });
    return this.authService.login(req.user);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async patchUser(
    @CurrentUser() user: User,
    @Body() patchUserDto: PatchUserDto,
  ) {
    return await this.usersService.patchUser(user.id, patchUserDto);
  }

  @Post('/verify-email')
  async verifyUser(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.usersService.verifyEmail(verifyEmailDto);
  }

  @Post('request-email-verification')
  async requestVerification(
    @Body() requestVerificationDto: RequestVerificationDto,
  ): Promise<{ message: string }> {
    await this.usersService.requestEmailVerification(
      requestVerificationDto.email,
    );
    return { message: 'Verification mail has been sent to this email' };
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      return {
        message:
          'Password reset link has been sent to the email address provided',
      };
    }
    const code = await this.verificationCodeService.generateCode({
      iden_type: IdentifierType.EMAIL,
      identifier: email,
      type: VerificationCodeType.RESET_PASSWORD,
      userId: user.id,
    });
    const template = forgotPasswordEmail({
      email: user.email,
      firstName: user.first_name,
      token: code,
    });
    await this.messagingService.sendEmail(template);
    return {
      message: `Password reset link successfully sent, check your inbox or spam; Link expires in ${SERVICE_EMAIL_EXPIRATION_TIME} min time`,
    };
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { code, password } = resetPasswordDto;
    const verificationCode = await this.verificationCodeService.verifyCode({
      code: code,
      type: VerificationCodeType.RESET_PASSWORD,
    });
    if (!verificationCode) {
      throw new HttpException(
        'Invalid or expired verification code try again later',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.usersService.updatePassword({
      email: verificationCode.identifier,
      password,
    });
    await this.verificationCodeService.markAsUsed(verificationCode.id);
    return { message: 'Password reset successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/request-phone-verification')
  async requestPhoneVerification(
    @Body() requestPhoneVerificationDto: RequestPhoneVerificationDto,
    @CurrentUser() user: User,
  ) {
    return await this.usersService.requestPhoneVerification(
      user,
      requestPhoneVerificationDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/verify-phone-number')
  async verifyPhoneNumber(
    @Body() verifyPhoneNumberDto: VerifyPhoneNumberDto,
    @CurrentUser() user: User,
  ) {
    return await this.usersService.verifyPhoneNumber(
      user,
      verifyPhoneNumberDto,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() currentUser: User) {
    return await this.usersService.getUserById(currentUser.id);
  }

  // transaction pin
  @Post('create-trnx-pin')
  @UseGuards(JwtAuthGuard)
  async createTransactionPin(
    @CurrentUser() user: User,
    @Body() createTransactionPinDto: CreateTransactionPinDto,
  ) {
    return await this.usersService.createTransactionPin(
      user,
      createTransactionPinDto,
    );
  }

  @Post('reset-trnx-pin')
  @UseGuards(JwtAuthGuard)
  async resetTransactionPin(
    @CurrentUser() user: User,
    @Body() resetTransactionPinDto: ResetTransactionPinDto,
  ) {
    return await this.usersService.resetTransactionPin(
      user,
      resetTransactionPinDto,
    );
  }

  @Post('change-trnx-pin')
  @UseGuards(JwtAuthGuard)
  async changeTransactionPin(
    @CurrentUser() currentUser: User,
    @Body() changeTransactionPinDto: ChangeTransactionPinDto,
  ) {
    return await this.usersService.changeTransactionPin(
      currentUser,
      changeTransactionPinDto,
    );
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() currentUser: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.usersService.changePassword(
      currentUser,
      changePasswordDto,
    );
  }

  @Post('request-trnx-pin-reset')
  @UseGuards(JwtAuthGuard)
  async requestResetTransactionPin(@CurrentUser() user: User, @Request() req) {
    return await this.usersService.requestResetTransactionPin(user);
  }

  @Get('/service-provider/:id')
  @UseGuards(JwtAuthGuard)
  async getServiceProvice(@Param('id') id: string) {
    const serviceProvider = await this.usersService.getServiceProvider(id);
    if (!serviceProvider) {
      throw new UserNotFoundException('Service provider not found');
    }
    return serviceProvider;
  }

  @Get('ping-trnx-pin')
  @UseGuards(JwtAuthGuard)
  async pingTransactionPin(
    @CurrentUser() user: User,
    @Query('pin') pin: string,
  ) {
    return await this.usersService.validateTransactionPin(user, pin);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.ADMIN)
  async listUsers(
    @Query() listUserQueryDto: ListUserQueryDto,
  ): Promise<PaginationResponse<User>> {
    return await this.usersService.listUsers(listUserQueryDto);
  }

  @Post('toggle-visibility')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER, UserRoles.CLIENT)
  async toggleVisibility(
    @CurrentUser() currentUser: User,
    @Body() toggleVisibility: ToggleVisibilityDto,
  ): Promise<ResponseMessage> {
    return await this.usersService.toggleVisibility(
      currentUser,
      toggleVisibility,
    );
  }

  @Post('toggle-availability')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async toggleAvailability(
    @CurrentUser() currentUser: User,
    @Body() toggleAvailabilityDto: ToggleAvailabilityDto,
  ): Promise<ResponseMessage> {
    return await this.usersService.toggleAvailability(
      currentUser,
      toggleAvailabilityDto,
    );
  }

  @Post('deactivate-account')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async deactivateAccount(
    @CurrentUser() currentUser: User,
    @Body() deactivateAccountDto: DeactivateAccountDto,
  ) {
    return await this.usersService.deactivateAccount(
      currentUser,
      deactivateAccountDto,
    );
  }

  @Post('delete-account')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async deleteAccount(
    @CurrentUser() currentUser: User,
    @Body() deleteAccountDto: DeleteAccountDto,
  ) {
    return await this.usersService.deleteAccount(currentUser, deleteAccountDto);
  }
}
