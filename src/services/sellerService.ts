import { supabase } from '../lib/supabase';

export interface SellerData {
  email: string;
  full_name: string;
  phone?: string;
  commission_rate?: number;
  status?: string;
}

export const sellerService = {
  async getAllSellers() {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  },

  async updateSeller(id: string, updates: Partial<SellerData>) {
    const { data, error } = await supabase
      .from('sellers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteSeller(id: string) {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-seller`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seller_id: id })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete seller');
    }
  },

  async deleteMultipleSellers(ids: string[]) {
    // Delete each seller using the edge function to ensure auth users are also deleted
    const deletePromises = ids.map(id => this.deleteSeller(id));
    await Promise.all(deletePromises);
  },

  async getSellerByEmail(email: string) {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
