import { useEffect, useCallback, useRef } from 'react';

interface WebSocketMessage {
  op?: string;
  type?: string;
  guild?: string;
  guildId?: string;
  data?: any;
  mode?: string;
}

export function usePlayerWebSocket(
  guildId: string | undefined,
  onPlayerDestroy: () => void,
  onPlayerUpdate: (data: any) => void,
  onTrackEnd: (data: any) => void,
  onTrackStart: (data: any) => void,
  onPlayerPause: () => void,
  onPlayerResume: () => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!guildId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || `${window.location.protocol}//${window.location.host}`;
    const wsUrl = `${protocol}//${new URL(baseUrl).host}/v1/websocket`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
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

          if (message.type === 'subscribe_success' || (message.type === 'error' && message.error?.includes('Already have connection'))) {
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
              onPlayerPause();
              break;
            case 'playerResume':
              onPlayerResume();
              break;
          }
        } catch (error) {
        }
      };

      ws.onerror = (error) => {
      };

      ws.onclose = () => {
        wsRef.current = null;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (error) {
    }
  }, [guildId, onPlayerDestroy, onPlayerUpdate, onTrackEnd, onTrackStart, onPlayerPause, onPlayerResume]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}
