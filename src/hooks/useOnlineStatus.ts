import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export const useOnlineStatus = (
  userId: string | number | null,
  userType: 'admin' | 'seller' | 'client' | null
) => {
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!userId || !userType) return;

    try {
      const table = userType === 'admin' ? 'admins' : userType === 'seller' ? 'sellers' : 'clients';

      await supabase
        .from(table)
        .update({
          is_online: isOnline,
          last_connection: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Erreur mise à jour statut en ligne:', error);
    }
  };

  const setOffline = async () => {
    if (!userId || !userType) return;

    try {
      const table = userType === 'admin' ? 'admins' : userType === 'seller' ? 'sellers' : 'clients';

      await supabase
        .from(table)
        .update({
          is_online: false
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Erreur mise à jour statut hors ligne:', error);
    }
  };

  useEffect(() => {
    if (!userId || !userType) return;

    updateOnlineStatus(true);

    heartbeatInterval.current = setInterval(() => {
      updateOnlineStatus(true);
    }, 5000);

    const handleBeforeUnload = () => {
      if (navigator.sendBeacon) {
        const table = userType === 'admin' ? 'admins' : userType === 'seller' ? 'sellers' : 'clients';
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?id=eq.${userId}`;
        const data = JSON.stringify({ is_online: false });

        navigator.sendBeacon(url, data);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        updateOnlineStatus(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      setOffline();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, userType]);

  return { updateOnlineStatus, setOffline };
};
