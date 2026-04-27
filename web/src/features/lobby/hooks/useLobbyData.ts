import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../core/supabase';
import { throwIfSupabaseError } from '../../../core/supabase-safe';
import type { BaseProfile, Room } from '../lobby.types';

const randomRoomCode = () => Math.random().toString(36).slice(2, 9).toUpperCase();

export const useLobbyData = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [baseProfiles, setBaseProfiles] = useState<BaseProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  const fetchBaseProfiles = useCallback(async () => {
    try {
      const { data, error: profilesError } = await supabase
        .from('perfis_base')
        .select('id,nickname,avatar')
        .order('nickname');

      throwIfSupabaseError(profilesError, 'Falha ao carregar perfis');
      setBaseProfiles((data || []) as BaseProfile[]);
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Falha ao carregar perfis');
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const { data, error: roomsError } = await supabase
        .from('partidas')
        .select('id,nome,codigo_sala,status,capital_inicial')
        .eq('status', 'LOBBY');

      throwIfSupabaseError(roomsError, 'Falha ao carregar salas');
      const roomsData = (data || []) as Omit<Room, 'players_count'>[];

      const withCounts = await Promise.all(
        roomsData.map(async (room) => {
          const { count, error: countError } = await supabase
            .from('jogadores')
            .select('*', { count: 'exact', head: true })
            .eq('partida_id', room.id);

          throwIfSupabaseError(countError, 'Falha ao contar jogadores');
          return { ...room, players_count: count || 0 };
        })
      );

      setRooms(withCounts);
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Falha ao carregar salas');
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchBaseProfiles();

    const subscription = supabase
      .channel('public:lobby-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidas' }, fetchRooms)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jogadores' }, fetchRooms)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'perfis_base' }, fetchBaseProfiles)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchBaseProfiles, fetchRooms]);

  const createRoom = async (name: string) => {
    const roomName = name.trim();
    if (!roomName) return;

    const { error: createError } = await supabase.from('partidas').insert({
      nome: roomName,
      codigo_sala: randomRoomCode()
    });
    throwIfSupabaseError(createError, 'Falha ao criar sala');
  };

  const deleteRoom = async (roomId: string) => {
    const { error: deleteError } = await supabase.from('partidas').delete().eq('id', roomId);
    throwIfSupabaseError(deleteError, 'Falha ao remover sala');
  };

  const createBaseProfile = async (nickname: string, avatar: string) => {
    const profileName = nickname.trim();
    if (!profileName) return;

    const { error: createError } = await supabase.from('perfis_base').insert({
      nickname: profileName,
      avatar
    });
    throwIfSupabaseError(createError, 'Falha ao criar perfil');
  };

  const deleteBaseProfile = async (profileId: string) => {
    const { error: deleteError } = await supabase.from('perfis_base').delete().eq('id', profileId);
    throwIfSupabaseError(deleteError, 'Falha ao remover perfil');
  };

  return {
    rooms,
    baseProfiles,
    error,
    fetchRooms,
    fetchBaseProfiles,
    createRoom,
    deleteRoom,
    createBaseProfile,
    deleteBaseProfile
  };
};
