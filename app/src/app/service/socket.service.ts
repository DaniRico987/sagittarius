import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoginService } from './login.service';
import { Message } from '../interface/message.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public socket!: Socket;
  private endPoint: string = environment.apiUrl;
  public connected$ = new BehaviorSubject<boolean>(false);

  constructor(private loginService: LoginService) {}

  // Conectar al socket con autenticación
  connect() {
    const token = this.loginService.getTokenValidation()
      ? this.loginService.token
      : null;

    if (!token) {
      console.error('No se encontró un token. No se puede conectar al socket.');
      return;
    }

    this.socket = io(this.endPoint, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Conectado al servidor de sockets');
      this.connected$.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Desconectado del servidor de sockets');
      this.connected$.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión al socket:', error);
      this.connected$.next(false);
    });
  }

  // Unirse a una sala (privada o grupo)
  joinChat(conversationId: string, userId?: string) {
    this.socket.emit('joinChat', { conversationId, userId });
  }

  // Unirse a la sala personal del usuario
  joinUserRoom(userId: string) {
    this.socket.emit('joinUserRoom', userId);
  }

  // Escuchar eventos del servidor
  onEvent<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      this.socket.on(event, (data: T) => {
        subscriber.next(data);
      });

      return () => {
        this.socket.off(event);
      };
    });
  }

  // Enviar un mensaje (privado o grupo)
  sendMessage(
    senderId: string,
    content: string,
    conversationId?: string,
    receiverId?: string
  ) {
    const message: any = {
      sender_id: senderId,
      content: content,
      timestamp: new Date(),
    };

    if (conversationId) {
      message.conversation_id = conversationId;
    } else if (receiverId) {
      message.receiver_id = receiverId;
    }

    console.log('📤 Enviando mensaje:', message);
    this.socket.emit('sendMessage', message);
  }

  // Crear conversación (grupo o chat)
  async createConversation(
    name: string,
    participants: string[],
    isGroup: boolean,
    admins: string[] = []
  ): Promise<any> {
    const response = await fetch(
      `${environment.apiUrl}/messages/conversations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, participants, isGroup, admins }),
      }
    );
    return await response.json();
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const response = await fetch(
      `${environment.apiUrl}/messages/conversations/${userId}`
    );
    return await response.json();
  }

  // Desconectar el socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 Socket desconectado');
    }
  }
}
