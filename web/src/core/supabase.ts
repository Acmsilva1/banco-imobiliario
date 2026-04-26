import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

export const useRealtime = (channelId: string) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!channelId) return;

    const channel = supabase.channel(channelId, {
      config: {
        broadcast: { self: true },
      },
    });

    channel
      .on('broadcast', { event: 'sync' }, ({ payload }) => {
        setData(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const broadcast = (payload: any) => {
    supabase.channel(channelId).send({
      type: 'broadcast',
      event: 'sync',
      payload,
    });
  };

  return { data, broadcast };
};
