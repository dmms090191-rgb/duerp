import { supabase } from '../lib/supabase';

export interface DiagnosticAdminNote {
  id: string;
  client_id: number;
  category: string;
  item: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const diagnosticNotesService = {
  async getNotesByClientId(clientId: number): Promise<Record<string, Record<string, string>>> {
    const { data, error } = await supabase
      .from('diagnostic_admin_notes')
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      console.error('Error fetching diagnostic notes:', error);
      return {};
    }

    const notesMap: Record<string, Record<string, string>> = {};
    data?.forEach((note) => {
      if (!notesMap[note.category]) {
        notesMap[note.category] = {};
      }
      notesMap[note.category][note.item] = note.notes || '';
    });

    return notesMap;
  },

  async saveNote(clientId: number, category: string, item: string, notes: string): Promise<boolean> {
    const { error } = await supabase
      .from('diagnostic_admin_notes')
      .upsert(
        {
          client_id: clientId,
          category,
          item,
          notes,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'client_id,category,item',
        }
      );

    if (error) {
      console.error('Error saving diagnostic note:', error);
      return false;
    }

    return true;
  },

  async deleteNote(clientId: number, category: string, item: string): Promise<boolean> {
    const { error } = await supabase
      .from('diagnostic_admin_notes')
      .delete()
      .eq('client_id', clientId)
      .eq('category', category)
      .eq('item', item);

    if (error) {
      console.error('Error deleting diagnostic note:', error);
      return false;
    }

    return true;
  },
};
