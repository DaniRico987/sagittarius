import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { UserChat } from '../interface/user-chat.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  receiver_id: string = '67d19052d5c06b0616b36c93'; // ID del receptor (ejemplo estático)
  constructor(private loginService: LoginService) {}

  getReceiverId(): string {
    return this.receiver_id;
  }

  getUserName(): UserChat | null {
    // First, try to get user from localStorage
    const cachedUser = localStorage.getItem('currentUser');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (error) {
        console.error('Error parsing cached user', error);
        localStorage.removeItem('currentUser');
      }
    }

    // If not in cache, decode from token
    const token: string | null = this.loginService.getTokenValidation()
      ? this.loginService.token
      : null;

    if (!token) return null;

    try {
      const tokenParts = token.split('.');

      // Validamos que el token tenga tres partes (header, payload, signature)
      if (tokenParts.length !== 3) {
        console.error('Token JWT inválido');
        return null;
      }

      const payloadBase64 = tokenParts[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const user: UserChat = {
        id: decodedPayload.sub,
        name: decodedPayload.name,
      };

      // Save user to localStorage for future use
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }

      return user ?? null; // Devuelve `null` si `name` no existe
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  // Métodos para amigos
  async getFriends(userId: string): Promise<any[]> {
    const response = await fetch(
      `${environment.apiUrl}/users/${userId}/friends`
    );
    return await response.json();
  }

  async getFriendRequests(userId: string): Promise<any[]> {
    const response = await fetch(
      `${environment.apiUrl}/users/${userId}/friend-requests`
    );
    return await response.json();
  }

  async sendFriendRequestByEmail(
    userId: string,
    friendEmail: string
  ): Promise<void> {
    const response = await fetch(
      `${environment.apiUrl}/users/friend-request/email`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, friendEmail }),
      }
    );
    if (!response.ok) {
      throw { status: response.status };
    }
  }

  async acceptFriendRequest(userId: string, friendId: string): Promise<void> {
    const response = await fetch(
      `${environment.apiUrl}/users/friend-request/accept`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, friendId }),
      }
    );
    if (!response.ok) {
      throw { status: response.status };
    }
  }

  async rejectFriendRequest(userId: string, friendId: string): Promise<void> {
    const response = await fetch(
      `${environment.apiUrl}/users/friend-request/reject`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, friendId }),
      }
    );
    if (!response.ok) {
      throw { status: response.status };
    }
  }
  async removeFriend(userId: string, friendId: string): Promise<void> {
    const response = await fetch(
      `${environment.apiUrl}/users/${userId}/friends/${friendId}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) {
      throw { status: response.status };
    }
  }
}
