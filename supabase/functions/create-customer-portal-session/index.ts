// Supabase Edge Function: create-customer-portal-session
// POST { customerId: string }
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.14.0?target=denonext";
// NOTE: Set verify_jwt = false in supabase/config.toml for this function if you get 401 errors from frontend

const stripe = new Stripe(Deno.env.get("STRIPE_TEST_SECRET_KEY")!, { apiVersion: "2023-10-16" });

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
    const body = await req.json();
    console.log("[customer-portal] Incoming body:", body);
    const stripeKey = Deno.env.get("STRIPE_TEST_SECRET_KEY");
    console.log("[customer-portal] Stripe key present:", !!stripeKey);
    const customerId = body.customerId;
    console.log("[customer-portal] customerId:", customerId);
    if (!customerId) {
      return withCorsHeaders(new Response(JSON.stringify({ error: "Missing customerId" }), { status: 400 }));
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "http://localhost:5173/account" // TODO: update to real return URL
    });
    return withCorsHeaders(new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" }
    }));
  } catch (err) {
    console.error("[create-customer-portal-session] Error:", err);
    return withCorsHeaders(new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 }));
  }
});
