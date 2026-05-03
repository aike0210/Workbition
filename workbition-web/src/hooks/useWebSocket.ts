import { useEffect, useRef, useCallback } from 'react'
import { IMessage } from '@stomp/stompjs'
import WebSocketClient from '@/websocket/WebSocketClient'
import { useAuthStore } from '@/stores/authStore'

interface UseWebSocketOptions {
  url?: string
  autoConnect?: boolean
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { url = '/ws', autoConnect = true } = options
  const clientRef = useRef<WebSocketClient | null>(null)
  const { token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (autoConnect && isAuthenticated && token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, token, autoConnect])

  const connect = useCallback(() => {
    if (!token) return

    clientRef.current = new WebSocketClient({
      url,
      onConnect: () => {
        console.log('WebSocket connected')
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected')
      },
      onError: (error) => {
        console.error('WebSocket error:', error)
      },
    })

    clientRef.current.connect(token)
  }, [token, url])

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect()
      clientRef.current = null
    }
  }, [])

  const subscribe = useCallback(
    (destination: string, callback: (message: IMessage) => void) => {
      if (clientRef.current) {
        return clientRef.current.subscribe(destination, callback)
      }
    },
    []
  )

  const unsubscribe = useCallback((destination: string) => {
    if (clientRef.current) {
      clientRef.current.unsubscribe(destination)
    }
  }, [])

  const send = useCallback(
    (destination: string, body: any, headers?: Record<string, string>) => {
      if (clientRef.current) {
        clientRef.current.send(destination, body, headers)
      }
    },
    []
  )

  const isConnected = useCallback(() => {
    return clientRef.current?.isConnected() || false
  }, [])

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    isConnected,
  }
}

export default useWebSocket