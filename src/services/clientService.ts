import { supabase } from '../lib/supabase';

export interface ClientData {
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  address?: string;
  project_description?: string;
  status?: string;
  assigned_agent_name?: string;
  prenom?: string;
  nom?: string;
  portable?: string;
  rendez_vous?: string;
  activite?: string;
  siret?: string;
  vendeur?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  anniversaire?: string;
  autre_courriel?: string;
  date_affectation?: string;
  representant?: string;
  prevente?: string;
  retention?: string;
  sous_affilie?: string;
  langue?: string;
  conseiller?: string;
  source?: string;
  qualifiee?: boolean;
  status_id?: string;
  client_password?: string;
  client_account_created?: boolean;
}

export const clientService = {
  async getAllClients() {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        status:statuses(id, name, color)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getClientById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getClientByEmail(email: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createClient(clientData: ClientData) {
    console.log('🔵 [clientService] Début createClient avec:', clientData);

    try {
      // Ne pas inclure l'ID - laisser la séquence le générer automatiquement
      const cleanedData = Object.fromEntries(
        Object.entries(clientData).filter(([_, value]) => value !== undefined)
      );

      console.log('🔵 [clientService] Données nettoyées à insérer:', cleanedData);

      const { data, error } = await supabase
        .from('clients')
        .insert([cleanedData])
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ [clientService] ERREUR INSERT:', error);
        console.error('❌ Code:', error.code);
        console.error('❌ Message:', error.message);
        console.error('❌ Details:', error.details);
        throw error;
      }

      if (!data) {
        console.error('❌ [clientService] Aucune donnée retournée après insert');
        throw new Error('Aucune donnée retournée');
      }

      console.log('✅ [clientService] Client créé avec succès, ID:', data.id);
      return data;
    } catch (err) {
      console.error('❌ [clientService] Exception:', err);
      throw err;
    }
  },

  async updateClient(id: string, updates: Partial<ClientData>) {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteClient(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateClientStatus(id: string, statusId: string | null) {
    const { data, error } = await supabase
      .from('clients')
      .update({ status_id: statusId })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
