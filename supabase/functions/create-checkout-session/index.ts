import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { createCheckoutSession } from "./lib.ts";

//FUNCTIONALITY: Creates a checkout session for a user to subscribe to a plan.//


//Change to STRIPE_SECRET_KEY when going live
const stripe = new Stripe(Deno.env.get("STRIPE_TEST_SECRET_KEY")!, { apiVersion: "2022-11-15" });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function withCorsHeaders(res: Response) {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-client-info");
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return withCorsHeaders(new Response(null, { status: 204 }));
  }
  if (req.method !== "POST") {
    return withCorsHeaders(new Response("Method Not Allowed", { status: 405 }));
  }
  try {
    const { userId, email } = await req.json();

    const priceId = Deno.env.get("STRIPE_TEST_PRICE_ID")!;
    const successUrl = "http://localhost:5173/account?success=true";
    const cancelUrl = "http://localhost:5173/subscribe";

    const result = await createCheckoutSession(
      { userId, email },
      { stripe: stripe as any, supabase: supabase as any },
      { priceId, successUrl, cancelUrl },
    );

    if (result.ok) {
      return withCorsHeaders(new Response(JSON.stringify({ url: result.url }), {
        headers: { "Content-Type": "application/json" }
      }));
    } else {
      const status = result.error.where === 'input' ? 400 : 500;
      return withCorsHeaders(new Response(JSON.stringify({ error: String(result.error.err?.message || result.error.err || 'error') }), { status }));
    }
  } catch (err) {
    console.error("[create-checkout-session] Error:", err);
    return withCorsHeaders(new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 }));
  }
});
