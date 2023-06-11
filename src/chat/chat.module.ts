import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/auth.constant';
import { ProposalModule } from 'src/proposal/proposal.module';
import { AuthModule } from 'src/auth/auth.module';
import { WebSocketGuard } from 'src/guards/websocket.guard';
import { Server } from 'socket.io';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/entities/chat.entity';
import { ChatHead } from 'src/entities/chat-head.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    ProposalModule,
    AuthModule,
    Server,
    TypeOrmModule.forFeature([Chat, ChatHead]),
  ],
  providers: [ChatGateway, ChatService, WebSocketGuard],
})
export class ChatModule {}
