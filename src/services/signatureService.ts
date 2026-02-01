import { supabase } from '../lib/supabase';

export const getActiveSignature = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('email_signature')
      .select('signature_html')
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching signature:', error);
      return '';
    }

    return data?.signature_html || '';
  } catch (error) {
    console.error('Error in getActiveSignature:', error);
    return '';
  }
};

export const addSignatureToEmail = (emailBody: string, signature: string): string => {
  if (!signature) return emailBody;

  return `${emailBody}\n\n${signature}`;
};
