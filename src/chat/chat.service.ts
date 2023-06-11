import { Inject, Injectable } from '@nestjs/common';
import { SendChatDto } from './dto/send-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ActionCreator } from 'src/common/interface';
import { Proposal } from 'src/entities/proposal.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/entities/chat.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { paginate } from 'nestjs-typeorm-paginate';
import { CatchErrorException } from 'src/exceptions';
import { ChatHead } from 'src/entities/chat-head.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ProposalService } from 'src/proposal/proposal.service';
import { Socket } from 'socket.io';
import { ChatProposal, WSMessageType } from './chat.interface';
import { WS_PROPOSAL_CACHE_TIME } from './chat.constant';
import { ProposalChatsDto } from './dto/proposal-chat.dto';
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatHead)
    private readonly chatHeadRepo: Repository<ChatHead>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly proposalService: ProposalService,
  ) {}

  async sendChat(
    userType: ActionCreator,
    sendChatDto: SendChatDto,
  ): Promise<Chat> {
    try {
      const { message, proposal_id } = sendChatDto;
      const chat = await this.chatRepo.create({
        message,
        user_type: userType,
        proposal_id,
      });
      return await this.chatRepo.save(chat);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async findChats(proposalChatsDto: ProposalChatsDto) {
    try {
      const { limit, page, proposal_id } = proposalChatsDto;
      const qb = this.chatRepo
        .createQueryBuilder('chat')
        .where('chat.proposal_id = :proposalId', { proposalId: proposal_id });
      return await paginate<Chat>(qb, { limit, page });
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  updateChat(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  deleteChat(id: number) {
    return `This action removes a #${id} chat`;
  }

  async createChatHead() {
    const newChatHead = await this.chatHeadRepo.create({});
  }

  async getChatProposal(
    proposalId: string,
    currentServer: Socket,
  ): Promise<ChatProposal | null> {
    let proposal: Proposal;
    const cachedProposal = await this.cacheManager.get<ChatProposal>(
      proposalId,
    );
    if (cachedProposal) {
      return cachedProposal;
    } else {
      proposal = await this.proposalService.getProposalById(
        proposalId,
        false,
        false,
      );
      if (!proposal) {
        currentServer.send({
          success: false,
          error: 'Invalid proposal',
          type: WSMessageType.NO_PROPOSAL,
        });
        return null;
      }
      const chatProposal: ChatProposal = {
        id: proposal.id,
        client: {
          id: proposal.service_request.created_by.id,
        },
        sp: {
          id: proposal.service_provider.id,
        },
      };
      this.cacheManager.set(proposalId, chatProposal, WS_PROPOSAL_CACHE_TIME);
      return chatProposal;
    }
  }

  async validateProposalOwners(
    proposal: ChatProposal,
    userType: ActionCreator,
    currentUserId: string,
    currentServer: Socket,
  ) {
    const { client, sp } = proposal;
    if (userType === 'CLIENT') {
      if (currentUserId === client.id) {
        return true;
      } else {
        currentServer.send({
          success: false,
          error: 'Invalid proposal client',
          type: WSMessageType.UNAUTHORISED_PROPOSAL_CLIENT,
        });
        return false;
      }
    }
    if (userType === 'SERVICE_PROVIDER') {
      if (currentUserId === sp.id) {
        return true;
      } else {
        currentServer.send({
          success: false,
          error: 'Invalid proposal service provider',
          type: WSMessageType.UNAUTHORISED_PROPOSAL_SP,
        });
        return false;
      }
    }
  }
}
