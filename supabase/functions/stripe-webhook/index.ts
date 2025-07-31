import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

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

// Stripe webhook signature verification in Deno
async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<any> {
  // Stripe sends: t=timestamp,v1=signature
  const [timestampPart, v1Part] = signature.split(",").map(s => s.trim());
  const timestamp = timestampPart.replace("t=", "");
  const v1 = v1Part.replace("v1=", "");
  const signedPayload = `${timestamp}.${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sigBuffer = encoder.encode(signedPayload);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, sigBuffer);
  const signatureHex = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  if (signatureHex !== v1) {
    throw new Error("Invalid Stripe signature");
  }
  return JSON.parse(body);
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

  // Handle Stripe events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerId = session.customer;
    console.log("[stripe-webhook] checkout.session.completed for customer:", customerId);
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_status: "active" })
      .eq("stripe_customer_id", customerId);
    if (error) console.error("[stripe-webhook] DB update error:", error);
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const status = subscription.status;
    console.log(`[stripe-webhook] ${event.type} for customer:`, customerId, "status:", status);
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_status: status })
      .eq("stripe_customer_id", customerId);
    if (error) console.error("[stripe-webhook] DB update error:", error);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    console.log("[stripe-webhook] customer.subscription.deleted for customer:", customerId);
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_status: "canceled" })
      .eq("stripe_customer_id", customerId);
    if (error) console.error("[stripe-webhook] DB update error:", error);
  }

  return withCorsHeaders(new Response(JSON.stringify({ received: true }), { status: 200 }));
});