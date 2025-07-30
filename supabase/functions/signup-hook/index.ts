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

const stripe = new Stripe(Deno.env.get("STRIPE_TEST_SECRET_KEY")!, { // After changing back to live, delete current user data from profiles table inorder to update stripe_customer_id
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

  // 2. Insert profile row into Supabase
  // Import the Supabase client
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.7");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error: insertError } = await supabase
    .from("profiles")
    .insert([
      {
        id,
        name,
        stripe_customer_id: customer.id
      }
    ]);

  // If error is not unique violation (row already exists), return error
  if (insertError && insertError.code !== "23505") {
    console.error("Profile row creation failed:", insertError);
    return withCorsHeaders(new Response("Profile row creation failed", { status: 500 }));
  }

  return withCorsHeaders(new Response("Success", { status: 200 }));
});
