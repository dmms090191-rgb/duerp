import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    const { priceId, clientId, employeeCount } = await req.json();

    if (!priceId) {
      throw new Error("Price ID is required");
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let clientEmail = null;
    let clientName = null;

    if (clientId) {
      const { data: client } = await supabase
        .from("clients")
        .select("email, nom_entreprise")
        .eq("id", clientId)
        .maybeSingle();

      if (client) {
        clientEmail = client.email;
        clientName = client.nom_entreprise;
      }
    }

    const origin = req.headers.get("origin") || "https://oxnmuprorefjrpnpixwa.supabase.co";

    const successUrl = clientId && employeeCount
      ? `${origin}/payment-success?client_id=${clientId}&employee_range=${employeeCount}`
      : `${origin}?payment=success`;

    const checkoutData = new URLSearchParams({
      "success_url": successUrl,
      "cancel_url": `${origin}?payment=cancelled`,
      "mode": "payment",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
    });

    if (clientEmail) {
      checkoutData.append("customer_email", clientEmail);
    }

    if (clientId) {
      checkoutData.append("metadata[client_id]", clientId.toString());
    }

    if (employeeCount) {
      checkoutData.append("metadata[employee_count]", employeeCount.toString());
    }

    if (clientName) {
      checkoutData.append("metadata[client_name]", clientName);
    }

    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: checkoutData.toString(),
      }
    );

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    const session = await stripeResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
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
