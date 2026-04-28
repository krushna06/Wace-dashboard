import { useEffect, useCallback, useRef } from 'react';

interface WebSocketMessage {
  op?: string;
  type?: string;
  guild?: string;
  guildId?: string;
  data?: any;
  mode?: string;
  error?: string;
}

export function usePlayerWebSocket(
  guildId: string | undefined,
  onPlayerDestroy: () => void,
  onPlayerUpdate: (data: any) => void,
  onTrackEnd: (data: any) => void,
  onTrackStart: (data: any) => void,
  onPlayerPause: (data?: any) => void,
  onPlayerResume: (data?: any) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const isCleanupRef = useRef(false);

  const connect = useCallback(() => {
    if (!guildId || isCleanupRef.current) return;
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      return;
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const protocol = apiBaseUrl.startsWith('https') ? 'wss:' : 'ws:';
    const host = apiBaseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const wsUrl = `${protocol}//${host}/v1/websocket`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        ws.send(JSON.stringify({
          type: 'auth',
          auth: process.env.NEXT_PUBLIC_API_AUTH_TOKEN || 'default-auth',
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === 'auth_success') {
            ws.send(JSON.stringify({
              type: 'subscribe',
              guildId: guildId,
            }));
            return;
          }

          if (message.type === 'subscribe_success' || (message.type === 'error' && message.error && message.error.includes('Already have connection'))) {
            return;
          }

          const op = message.op || message.type;
          const guild = message.guild || message.guildId;

          if (guild !== guildId) return;

          switch (op) {
            case 'playerDestroy':
              onPlayerDestroy();
              break;
            case 'playerUpdate':
              onPlayerUpdate(message.data);
              break;
            case 'trackEnd':
              onTrackEnd(message.data);
              break;
            case 'trackStart':
              onTrackStart(message.data);
              break;
            case 'playerPause':
              onPlayerPause(message.data);
              break;
            case 'playerResume':
              onPlayerResume(message.data);
              break;
          }
        } catch (error) {
        }
      };

      ws.onerror = () => {
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!isCleanupRef.current) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      // Silent error handling
    }
  }, [guildId, onPlayerDestroy, onPlayerUpdate, onTrackEnd, onTrackStart, onPlayerPause, onPlayerResume]);

  useEffect(() => {
    isCleanupRef.current = false;
    connect();
    return () => {
      isCleanupRef.current = true;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}
