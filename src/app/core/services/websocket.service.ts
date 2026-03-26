import { Injectable } from '@angular/core';
import { Client, IMessage, StompConfig } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client: Client | null = null;
  private readonly connectionStatus = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeout: any;

  public connectionStatus$ = this.connectionStatus.asObservable();

  connect(token: string): void {
    if (this.client?.active) {
      console.log('WebSocket already connected');
      return;
    }

    // SockJS uses HTTP/HTTPS, not WS/WSS - it handles the protocol upgrade internally
    const wsUrl = environment.apiUrl + '/ws';

    const config: StompConfig = {
      webSocketFactory: () => {
        return new SockJS(wsUrl) as any;
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str: string) => {
        if (environment.apiUrl.includes('localhost')) {
          console.log('STOMP:', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log('✅ WebSocket connected successfully');
        this.connectionStatus.next(true);
        this.reconnectAttempts = 0;
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
        this.connectionStatus.next(false);
        this.handleReconnect(token);
      },
      onWebSocketClose: () => {
        console.log('🔌 WebSocket connection closed');
        this.connectionStatus.next(false);
        this.handleReconnect(token);
      },
      onWebSocketError: (error) => {
        console.error('❌ WebSocket error:', error);
        this.connectionStatus.next(false);
      },
    };

    this.client = new Client(config);
    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connectionStatus.next(false);
      this.reconnectAttempts = 0;

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      console.log('🔌 WebSocket disconnected');
    }
  }

  subscribe<T>(destination: string, callback: (message: T) => void): () => void {
    if (!this.client) {
      console.error('Cannot subscribe: WebSocket client not initialized');
      return () => {};
    }

    // Wait for connection before subscribing
    if (!this.client.connected) {
      console.log('Waiting for WebSocket connection before subscribing...');
      
      // Store the subscription to be executed after connection
      const connectCallback = () => {
        if (this.client?.connected) {
          this.performSubscription(destination, callback);
        }
      };
      
      // Listen for connection and then subscribe
      const tempSub = this.connectionStatus$.subscribe((connected) => {
        if (connected) {
          connectCallback();
          tempSub.unsubscribe();
        }
      });
      
      return () => tempSub.unsubscribe();
    }

    return this.performSubscription(destination, callback);
  }

  private performSubscription<T>(destination: string, callback: (message: T) => void): () => void {
    const subscription = this.client!.subscribe(destination, (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body) as T;
        callback(payload);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Return unsubscribe function
    return () => subscription.unsubscribe();
  }

  private handleReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`🔄 Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      console.log('🔄 Attempting to reconnect...');
      this.connect(token);
    }, delay);
  }

  isConnected(): boolean {
    return this.connectionStatus.value;
  }
}
