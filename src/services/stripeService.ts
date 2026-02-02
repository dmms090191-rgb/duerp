import { supabase } from '../lib/supabase';

export interface StripeProduct {
  id: string;
  stripe_product_id: string;
  stripe_price_id: string;
  name: string;
  description: string;
  price: number;
  unit_amount: number;
  currency: string;
  employee_range: string;
  is_active: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
}

export const stripeService = {
  async syncProducts(): Promise<{ success: boolean; products?: StripeProduct[]; error?: string }> {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-stripe-products`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error syncing Stripe products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync products',
      };
    }
  },

  async getProducts(): Promise<StripeProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('unit_amount', { ascending: true });

      if (error) throw error;

      if (!data) return [];

      const zeroToOneProduct = data.find(p => p.employee_range === '0-1');
      const otherProducts = data.filter(p => p.employee_range !== '0-1');

      return zeroToOneProduct ? [...otherProducts, zeroToOneProduct] : data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async getProductByEmployeeRange(employeeRange: string): Promise<StripeProduct | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('employee_range', employeeRange)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product by employee range:', error);
      return null;
    }
  },

  async createCheckoutSession(
    priceId: string,
    clientId?: number,
    employeeCount?: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-checkout`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          clientId,
          employeeCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout',
      };
    }
  },

  getEmployeeRangeOptions() {
    return [
      { value: '0-1', label: 'Moins de 5 salariés', maxEmployees: 5 },
      { value: '1-5', label: "Jusqu'à 5 salariés", maxEmployees: 5 },
      { value: '6-10', label: "Jusqu'à 10 salariés", maxEmployees: 10 },
      { value: '11-15', label: "Jusqu'à 15 salariés", maxEmployees: 15 },
      { value: '16-25', label: "Jusqu'à 25 salariés", maxEmployees: 25 },
      { value: '26-50', label: "Jusqu'à 50 salariés", maxEmployees: 50 },
    ];
  },

  getEmployeeRangeByCount(count: number): string {
    if (count <= 1) return '0-1';
    if (count <= 5) return '1-5';
    if (count <= 10) return '6-10';
    if (count <= 15) return '11-15';
    if (count <= 25) return '16-25';
    if (count <= 50) return '26-50';
    return '26-50';
  },
};
