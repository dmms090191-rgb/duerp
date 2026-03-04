import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    console.log('🔍 Vérification du statut de la session Stripe:', sessionId);

    const stripeResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
        },
      }
    );

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      console.error('❌ Erreur Stripe API:', error);
      throw new Error(`Stripe API error: ${error}`);
    }

    const session = await stripeResponse.json();

    console.log('✅ Session Stripe récupérée:', {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status
    });

    const isPaid = session.payment_status === 'paid';
    const isComplete = session.status === 'complete';

    return new Response(
      JSON.stringify({
        success: true,
        isPaid,
        isComplete,
        paymentStatus: session.payment_status,
        sessionStatus: session.status,
        amount: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Erreur vérification paiement:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        isPaid: false,
        isComplete: false
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
