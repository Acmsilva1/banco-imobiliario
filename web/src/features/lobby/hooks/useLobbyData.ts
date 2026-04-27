import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../core/supabase';
import { throwIfSupabaseError } from '../../../core/supabase-safe';
import type { BaseProfile, Room } from '../lobby.types';

const randomRoomCode = () => Math.random().toString(36).slice(2, 9).toUpperCase();

/** Base remota sem migração `lider_nickname` → PostgREST devolve 400 / PGRST204 / 42703 */
const isLiderNicknameUnavailable = (err: unknown): boolean => {
  if (!err || typeof err !== 'object') return false;
  const o = err as { code?: string; message?: string; details?: string; hint?: string };
  const blob = [o.code, o.message, o.details, o.hint].filter(Boolean).join(' ').toLowerCase();
  return (
    o.code === '42703' ||
    o.code === 'PGRST204' ||
    blob.includes('lider_nickname') ||
    (blob.includes('column') && blob.includes('does not exist'))
  );
};

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
      const withLeader = await supabase
        .from('partidas')
        .select('id,nome,codigo_sala,status,capital_inicial,lider_nickname')
        .eq('status', 'LOBBY');

      const fallback =
        withLeader.error && isLiderNicknameUnavailable(withLeader.error)
          ? await supabase
              .from('partidas')
              .select('id,nome,codigo_sala,status,capital_inicial')
              .eq('status', 'LOBBY')
          : null;

      const roomsRes = fallback ?? withLeader;
      throwIfSupabaseError(roomsRes.error, 'Falha ao carregar salas');
      const raw = roomsRes.data || [];
      const roomsData = raw.map((row) => ({
        ...(row as Omit<Room, 'players_count'>),
        lider_nickname: (row as { lider_nickname?: string | null }).lider_nickname ?? null
      }));

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

  const createRoom = async (name: string, liderNickname: string) => {
    const roomName = name.trim();
    const leader = liderNickname.trim();
    if (!roomName || !leader) return;

    let { error: createError } = await supabase.from('partidas').insert({
      nome: roomName,
      codigo_sala: randomRoomCode(),
      lider_nickname: leader
    });

    if (createError && isLiderNicknameUnavailable(createError)) {
      ({ error: createError } = await supabase.from('partidas').insert({
        nome: roomName,
        codigo_sala: randomRoomCode()
      }));
    }

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
