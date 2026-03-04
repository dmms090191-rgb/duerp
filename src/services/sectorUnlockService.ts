import { supabase } from '../lib/supabase';

export interface UnlockedSector {
  id: string;
  client_id: number;
  sector_id: string;
  sector_name: string;
  unlocked_by?: string;
  unlocked_at: string;
  created_at: string;
}

class SectorUnlockService {
  async getUnlockedSectors(clientId: number): Promise<UnlockedSector[]> {
    const { data, error } = await supabase
      .from('client_unlocked_sectors')
      .select('*')
      .eq('client_id', clientId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching unlocked sectors:', error);
      throw error;
    }

    return data || [];
  }

  async unlockSector(clientId: number, sectorId: string, sectorName: string, unlockedBy?: string): Promise<UnlockedSector> {
    const { data, error } = await supabase
      .from('client_unlocked_sectors')
      .insert({
        client_id: clientId,
        sector_id: sectorId,
        sector_name: sectorName,
        unlocked_by: unlockedBy,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.log('Sector already unlocked for this client');
        const { data: existingData } = await supabase
          .from('client_unlocked_sectors')
          .select('*')
          .eq('client_id', clientId)
          .eq('sector_id', sectorId)
          .single();

        if (existingData) {
          return existingData;
        }
      }
      console.error('Error unlocking sector:', error);
      throw error;
    }

    return data;
  }

  async unlockAllSectors(clientId: number, sectors: { id: string; name: string }[], unlockedBy?: string): Promise<void> {
    const insertData = sectors.map(sector => ({
      client_id: clientId,
      sector_id: sector.id,
      sector_name: sector.name,
      unlocked_by: unlockedBy,
    }));

    const { error } = await supabase
      .from('client_unlocked_sectors')
      .upsert(insertData, {
        onConflict: 'client_id,sector_id',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('Error unlocking all sectors:', error);
      throw error;
    }
  }

  async lockSector(clientId: number, sectorId: string): Promise<void> {
    const { error } = await supabase
      .from('client_unlocked_sectors')
      .delete()
      .eq('client_id', clientId)
      .eq('sector_id', sectorId);

    if (error) {
      console.error('Error locking sector:', error);
      throw error;
    }
  }

  async lockAllSectors(clientId: number): Promise<void> {
    const { error } = await supabase
      .from('client_unlocked_sectors')
      .delete()
      .eq('client_id', clientId);

    if (error) {
      console.error('Error locking all sectors:', error);
      throw error;
    }
  }

  async isClientSectorUnlocked(clientId: number, sectorId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('client_unlocked_sectors')
      .select('id')
      .eq('client_id', clientId)
      .eq('sector_id', sectorId)
      .maybeSingle();

    if (error) {
      console.error('Error checking sector unlock status:', error);
      return false;
    }

    return !!data;
  }

  async selectSingleSector(clientId: number, sectorId: string, sectorName: string, selectedBy?: string): Promise<void> {
    await this.lockAllSectors(clientId);
    await this.unlockSector(clientId, sectorId, sectorName, selectedBy);
  }

  async toggleSectorLock(clientId: number, sectorId: string, sectorName: string, toggledBy?: string): Promise<boolean> {
    const isUnlocked = await this.isClientSectorUnlocked(clientId, sectorId);

    if (isUnlocked) {
      await this.lockSector(clientId, sectorId);
      return false;
    } else {
      await this.unlockSector(clientId, sectorId, sectorName, toggledBy);
      return true;
    }
  }

  subscribeToUnlockedSectors(clientId: number, callback: (sectors: UnlockedSector[]) => void) {
    const channel = supabase
      .channel(`client_unlocked_sectors:${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_unlocked_sectors',
          filter: `client_id=eq.${clientId}`
        },
        async () => {
          const sectors = await this.getUnlockedSectors(clientId);
          callback(sectors);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const sectorUnlockService = new SectorUnlockService();
