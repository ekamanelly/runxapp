import { CanActivate, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WSMessageType } from 'src/chat/chat.interface';
import { ActionCreator } from 'src/common/interface';

@Injectable()
export class WebSocketGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: any): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const bearerToken = client.handshake.headers?.authorization;
    const userType = client.handshake.query?.user_type as ActionCreator;
    const jwtToken = bearerToken ? bearerToken.split(' ')[1] : null;
    if (!jwtToken) {
      client.send({
        success: false,
        error: 'Authorization token required',
        type: WSMessageType.NO_TOKEN,
      });
      return false;
    }
    const decoded = await this.jwtService.verify(jwtToken);
    if (!decoded) {
      client.send({
        success: false,
        error: 'Unathourized connection',
        type: WSMessageType.NOT_AUTHORIZED,
      });
      return false;
    }
    client.handshake.headers.userType = userType;
    client.handshake.headers.currentUserId = decoded.sub;
    return true;
  }
}
