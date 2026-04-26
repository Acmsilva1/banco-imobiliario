import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState, TransferPayload } from '../bank.types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useSocket = (partidaId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>({ players: [], logs: [] });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!partidaId) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_room', partidaId);
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('sync_state', (state: GameState) => {
      setGameState(state);
    });

    socket.on('error_message', (msg: string) => {
      setError(msg);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, [partidaId]);

  const transfer = (payload: TransferPayload) => {
    socketRef.current?.emit('exec_transfer', payload);
  };

  const adjustBalance = (playerId: string, amount: number, label: string) => {
    socketRef.current?.emit('adjust_balance', { playerId, amount, label, partidaId });
  };

  return { gameState, isConnected, error, transfer, adjustBalance };
};
