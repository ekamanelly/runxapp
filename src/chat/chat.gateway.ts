import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { SendChatDto } from './dto/send-chat.dto';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WebSocketGuard } from 'src/guards/websocket.guard';
import { ActionCreator } from 'src/common/interface';
import { WSMessageType } from './chat.interface';
import { WEBSOCKET_EVENT } from './chat.constant';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ProposalChatsDto } from './dto/proposal-chat.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Socket;

  async handleConnection(client: Socket) {
    client.send({
      success: false,
      error: 'Connection successfully established',
      type: WSMessageType.CONNECTION_SUCCESSFUL,
    });
  }

  async handleDisconnect(socket: Socket) {
    console.log('Disconnection handleDisconnection succesful');
  }

  @UseGuards(WebSocketGuard)
  @SubscribeMessage(WEBSOCKET_EVENT.sendChat)
  async sendChat(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    sendChatDto: SendChatDto,
  ) {
    const userType = client.request.headers
      .userType as unknown as ActionCreator;
    const currentUserId = client.request.headers
      .currentUserId as unknown as ActionCreator;
    console.log({ userType, currentUserId, sendChatDto });
    if (!sendChatDto.message) {
      return client.send({
        success: false,
        error: 'Message is required',
        type: WSMessageType.MESSAGE_REQUIRED,
      });
    }
    const { proposal_id } = sendChatDto;
    const chatProposal = await this.chatService.getChatProposal(
      proposal_id,
      client,
    );
    if (!chatProposal) return;
    const validateProposalOwners =
      await this.chatService.validateProposalOwners(
        chatProposal,
        userType,
        currentUserId,
        client,
      );
    if (!validateProposalOwners) return;
    const chat = await this.chatService.sendChat(userType, sendChatDto);
    return this.server.emit(proposal_id, chat);
  }

  @SubscribeMessage(WEBSOCKET_EVENT.updateChat)
  update(@MessageBody() upUpdateMessageDto: UpdateChatDto) {
    return this.chatService.updateChat(
      upUpdateMessageDto.id,
      upUpdateMessageDto,
    );
  }

  @UseGuards(WebSocketGuard)
  @SubscribeMessage(WEBSOCKET_EVENT.deleteChat)
  deleteChat(@MessageBody() id: number) {
    return this.chatService.deleteChat(id);
  }

  @UseGuards(WebSocketGuard)
  @SubscribeMessage(WEBSOCKET_EVENT.getProposalChats)
  async getProposalChats(
    @ConnectedSocket()
    client: Socket,
    @MessageBody() proposalChatsDto: ProposalChatsDto,
  ) {
    const userType = client.request.headers
      .userType as unknown as ActionCreator;
    const currentUserId = client.request.headers
      .currentUserId as unknown as ActionCreator;
    const chatProposal = await this.chatService.getChatProposal(
      proposalChatsDto.proposal_id,
      client,
    );
    const { proposal_id } = proposalChatsDto;
    if (!chatProposal) return;
    const validateProposalOwners =
      await this.chatService.validateProposalOwners(
        chatProposal,
        userType,
        currentUserId,
        client,
      );
    if (!validateProposalOwners) return;
    const chats = await this.chatService.findChats(proposalChatsDto);
    return client.emit(WEBSOCKET_EVENT.proposalChats + proposal_id, chats);
  }
}
