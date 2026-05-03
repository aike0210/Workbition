import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

interface WebSocketConfig {
  url: string
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: string) => void
}

class WebSocketClient {
  private client: Client | null = null
  private config: WebSocketConfig
  private subscriptions: Map<string, any> = new Map()

  constructor(config: WebSocketConfig) {
    this.config = config
  }

  connect(token: string) {
    this.client = new Client({
      webSocketFactory: () => new SockJS(this.config.url),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP Debug:', str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected')
        this.config.onConnect?.()
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected')
        this.config.onDisconnect?.()
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message'])
        this.config.onError?.(frame.headers['message'])
      },
    })

    this.client.activate()
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate()
      this.client = null
    }
    this.subscriptions.clear()
  }

  subscribe(destination: string, callback: (message: IMessage) => void) {
    if (!this.client || !this.client.connected) {
      console.warn('WebSocket not connected')
      return
    }

    const subscription = this.client.subscribe(destination, callback)
    this.subscriptions.set(destination, subscription)
    return subscription
  }

  unsubscribe(destination: string) {
    const subscription = this.subscriptions.get(destination)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(destination)
    }
  }

  send(destination: string, body: any, headers?: Record<string, string>) {
    if (!this.client || !this.client.connected) {
      console.warn('WebSocket not connected')
      return
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
      headers,
    })
  }

  isConnected(): boolean {
    return this.client?.connected || false
  }
}

export default WebSocketClient