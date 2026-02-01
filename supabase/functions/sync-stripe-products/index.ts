import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  active: boolean;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
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

    const stripePricesResponse = await fetch(
      "https://api.stripe.com/v1/prices?active=true&expand[]=data.product",
      {
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
        },
      }
    );

    if (!stripePricesResponse.ok) {
      const error = await stripePricesResponse.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    const stripePricesData = await stripePricesResponse.json();
    const prices: StripePrice[] = stripePricesData.data;

    const employeeRanges: Record<number, string> = {
      83000: "1-5",
      100000: "6-10",
      123000: "11-15",
      162500: "16-25",
      215000: "26-50",
      29000: "0-1",
    };

    const syncedProducts = [];

    for (const price of prices) {
      const product = price.product as any;
      const employeeRange = employeeRanges[price.unit_amount];

      if (!employeeRange) {
        console.log(`No employee range mapping for price ${price.unit_amount}`);
        continue;
      }

      const { data, error } = await supabase
        .from("products")
        .upsert(
          {
            stripe_product_id: product.id,
            stripe_price_id: price.id,
            name: `${product.name} - ${employeeRange} salariés`,
            description: product.description || "Prise en charge DUERP",
            price: price.unit_amount / 100,
            unit_amount: price.unit_amount,
            currency: price.currency,
            employee_range: employeeRange,
            is_active: price.active && product.active,
            stock: 9999,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_price_id" }
        )
        .select()
        .maybeSingle();

      if (error) {
        console.error(`Error syncing product ${product.id}:`, error);
      } else {
        syncedProducts.push(data);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${syncedProducts.length} products`,
        products: syncedProducts,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error syncing Stripe products:", error);
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
