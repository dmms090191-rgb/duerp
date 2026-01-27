import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { seller_id } = await req.json();

    if (!seller_id) {
      return new Response(
        JSON.stringify({ error: 'seller_id is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { data: seller, error: sellerError } = await supabaseAdmin
      .from('sellers')
      .select('email, id')
      .eq('id', seller_id)
      .maybeSingle();

    if (sellerError) {
      console.error('Error fetching seller:', sellerError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch seller', details: sellerError }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!seller) {
      return new Response(
        JSON.stringify({ error: 'Seller not found' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log(`Starting complete deletion for seller ${seller_id}`);

    // 1. Supprimer les messages admin-vendeur
    const { error: messagesError } = await supabaseAdmin
      .from('admin_seller_messages')
      .delete()
      .or(`seller_id.eq.${seller_id},sender_id.eq.${seller_id}`);

    if (messagesError) {
      console.error('Error deleting admin_seller_messages:', messagesError);
    } else {
      console.log('Admin-seller messages deleted successfully');
    }

    // 2. Mettre à null l'agent assigné dans clients
    const { error: clientsError } = await supabaseAdmin
      .from('clients')
      .update({ assigned_agent: null, assigned_agent_name: null })
      .eq('assigned_agent', seller_id);

    if (clientsError) {
      console.error('Error updating clients:', clientsError);
    } else {
      console.log('Clients unassigned successfully');
    }

    // 3. Mettre à null l'agent assigné dans leads
    const { error: leadsError } = await supabaseAdmin
      .from('leads')
      .update({ assigned_to: null })
      .eq('assigned_to', seller_id);

    if (leadsError) {
      console.error('Error updating leads:', leadsError);
    } else {
      console.log('Leads unassigned successfully');
    }

    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.listUsers();

    if (authUserError) {
      console.error('Error listing auth users:', authUserError);
    } else {
      const userToDelete = authUser.users.find((u) => u.email === seller.email);

      if (userToDelete) {
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);

        if (deleteAuthError) {
          console.error('Error deleting auth user:', deleteAuthError);
        } else {
          console.log('Auth user deleted successfully');
        }
      }
    }

    const { error: deleteSellerError } = await supabaseAdmin
      .from('sellers')
      .delete()
      .eq('id', seller_id);

    if (deleteSellerError) {
      console.error('Error deleting seller:', deleteSellerError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete seller', details: deleteSellerError }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Seller and auth user deleted successfully' }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
