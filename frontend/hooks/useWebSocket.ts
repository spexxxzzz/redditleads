import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface UseWebSocketOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws',
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const { getToken } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const isConnecting = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const connect = useCallback(async () => {
    if (isConnecting.current || (ws.current && ws.current.readyState === WebSocket.OPEN)) {
      return;
    }

    isConnecting.current = true;

    try {
      const token = await getToken();
      const wsUrl = `${url}?token=${token}`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        isConnecting.current = false;
        reconnectAttempts.current = 0;
        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        isConnecting.current = false;
        onDisconnect?.();

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnecting.current = false;
        onError?.(error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      isConnecting.current = false;
    }
  }, [url, getToken, onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
      ws.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
}

// Specialized hook for real-time lead updates
export function useRealTimeLeads(projectId: string) {
  const [leads, setLeads] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const { isConnected, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'leads_updated' && message.data.projectId === projectId) {
        setIsUpdating(true);
        setLeads(message.data.leads);
        
        // Reset updating state after a short delay
        setTimeout(() => setIsUpdating(false), 1000);
      }
    }
  });

  return {
    leads,
    isUpdating,
    isConnected
  };
}

// Specialized hook for real-time usage updates
export function useRealTimeUsage() {
  const [usage, setUsage] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { isConnected, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'usage_updated') {
        setIsUpdating(true);
        setUsage(message.data);
        
        // Reset updating state after a short delay
        setTimeout(() => setIsUpdating(false), 1000);
      }
    }
  });

  return {
    usage,
    isUpdating,
    isConnected
  };
}
