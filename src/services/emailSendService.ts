import { supabase } from '../lib/supabase';

export type EmailType = 'identifiants' | 'relance' | 'procedure_prise_en_charge';

export interface SendEmailParams {
  clientId: number;
  emailType: EmailType;
  generatePDFs?: boolean;
  senderEmail?: string;
}

export interface EmailSendResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const sendEmail = async (params: SendEmailParams): Promise<EmailSendResult> => {
  try {
    console.log('📧 Envoi d\'email avec les paramètres:', params);

    const { data, error } = await supabase.functions.invoke('envoyer-un-email', {
      body: params
    });

    console.log('📧 Réponse de l\'Edge Function:', { data, error });

    if (error) {
      console.error('❌ Erreur de l\'Edge Function:', error);
      throw new Error(error.message || 'Erreur lors de l\'appel à l\'Edge Function');
    }

    if (!data || !data.success) {
      console.error('❌ Échec de l\'envoi:', data);
      throw new Error(data?.error || 'Erreur lors de l\'envoi de l\'email');
    }

    console.log('✅ Email envoyé avec succès:', data.message);
    return {
      success: true,
      message: data.message || 'Email envoyé avec succès'
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};

export const getEmailHistory = async (clientId?: number) => {
  try {
    let query = supabase
      .from('email_send_history')
      .select('*')
      .order('sent_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return { data: null, error };
  }
};
