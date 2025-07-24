import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.16.0?target=deno";

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

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return withCorsHeaders(new Response(null, { status: 204 }));
  }
  if (req.method !== "POST") {
    return withCorsHeaders(new Response("Method Not Allowed", { status: 405 }));
  }

  const { id, email, name } = await req.json();

  // 1. Create Stripe customer
  let customer;
  try {
    customer = await stripe.customers.create({
      email,
      name,
      metadata: { user_id: id }
    });
  } catch (err) {
    console.error("Stripe customer creation failed:", err);
    return withCorsHeaders(new Response("Stripe customer creation failed", { status: 500 }));
  }

  // 2. Update profiles table
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  // DEBUG: Log env vars (do NOT log secrets in production)
  console.log("supabaseUrl:", supabaseUrl);
  console.log("supabaseKey:", supabaseKey);
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ stripe_customer_id: customer.id })
  });

  if (!response.ok) {
    console.error("Failed to update profiles table:", await response.text());
    return withCorsHeaders(new Response("Failed to update profiles table", { status: 500 }));
  }

  return withCorsHeaders(new Response(JSON.stringify({ stripe_customer_id: customer.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  }));
});
