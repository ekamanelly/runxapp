import { Module } from '@nestjs/common';
import { ServiceProviderService } from './service-provider.service';
import { ServiceProviderController } from './service-provider.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from 'src/entities/proposal.entity';
import { ProposalModule } from 'src/proposal/proposal.module';
import { User } from 'src/entities/user.entity';
import { ServiceTypesModule } from 'src/services-types/service-types.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal, User]),
    ProposalModule,
    ServiceTypesModule,
    UsersModule,
  ],
  controllers: [ServiceProviderController],
  providers: [ServiceProviderService],
})
export class ServiceProviderModule {}
