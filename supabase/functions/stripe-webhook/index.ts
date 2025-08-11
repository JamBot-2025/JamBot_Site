import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyStripeSignature, handleStripeEvent } from "./lib.ts";

// FUNCTIONALITY: Stripe webhook entrypoint; verifies signature, inits Supabase, delegates to handler.

function withCorsHeaders(res: Response) {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-client-info, stripe-signature");
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

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const body = await req.text();

  let event;
  try {
    event = await verifyStripeSignature(body, sig!, webhookSecret);
  } catch (err) {
    return withCorsHeaders(new Response(`Webhook Error: ${err}`, { status: 400 }));
  }

  // Setup Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Delegate to shared handler for DB updates
  await handleStripeEvent(supabase as any, event as any);

  return withCorsHeaders(new Response(JSON.stringify({ received: true }), { status: 200 }));
});