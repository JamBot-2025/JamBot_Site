// Edge Function: update-stripe-customer
// Updates Stripe customer name and/or email for the authenticated user
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.14.0?target=denonext";
import { supabase } from "./supabaseClient.ts";

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
    const { user_id, stripe_customer_id, name, email, plan, status, nextBillingDate } = body;
    if (!user_id || !stripe_customer_id) {
      return withCorsHeaders(new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 }));
    }
    if (email || plan || status || nextBillingDate) {
      return withCorsHeaders(new Response(JSON.stringify({ error: "Only name changes are allowed." }), { status: 400 }));
    }
    let updatedUser = null;
    if (!name) {
      return withCorsHeaders(new Response(JSON.stringify({ error: "Only name changes are allowed." }), { status: 400 }));
    }
    // Update Supabase Auth user_metadata.name
    const updateParams: any = { user_metadata: { name } };
    console.log("[update-stripe-customer] Attempting user update", { user_id, updateParams });
    const { data, error: authError } = await supabase.auth.admin.updateUserById(user_id, updateParams);
    console.log("[update-stripe-customer] updateUserById result", { data, authError });
    if (authError) {
      console.error("[update-stripe-customer] Supabase Auth error:", authError);
      return withCorsHeaders(new Response(JSON.stringify({ error: "Failed to update Supabase Auth" }), { status: 500 }));
    }
    updatedUser = data.user || data;
    // Update Stripe name only
    try {
      await stripe.customers.update(stripe_customer_id, { name });
    } catch (err) {
      console.error("[update-stripe-customer] Stripe update error", err);
      return withCorsHeaders(new Response(JSON.stringify({ error: "Failed to update Stripe" }), { status: 500 }));
    }
    return withCorsHeaders(new Response(JSON.stringify({ success: true, user: updatedUser }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));
  } catch (err) {
    console.error("[update-stripe-customer] Error:", err);
    return withCorsHeaders(new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 }));
  }
});
