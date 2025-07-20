import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.16.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  if (req.method === "GET") {
    // Simple test endpoint
    return new Response("create-stripe-customer OK", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let email, name, user_id;
  try {
    ({ email, name, user_id } = await req.json());
    if (!email || !user_id) {
      console.error("Missing email or user_id", { email, user_id });
      return new Response("Missing email or user_id", { status: 400 });
    }
  } catch (err) {
    console.error("Invalid JSON body", err);
    return new Response("Invalid JSON body", { status: 400 });
  }

  // 1. Create Stripe Customer
  let customer;
  try {
    customer = await stripe.customers.create({
      email,
      name,
      metadata: { user_id }
    });
    console.log("Stripe customer created:", customer.id);
  } catch (err) {
    console.error("Stripe customer creation failed:", err);
    return new Response(`Stripe customer creation failed: ${err.message || err}`, { status: 500 });
  }

  // 2. Store Stripe customer ID in Supabase
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { error } = await supabase
      .from("profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("id", user_id);

    if (error) {
      console.error("Failed to update Supabase profile:", error);
      return new Response("Supabase update failed", { status: 500 });
    }
  } catch (err) {
    console.error("Supabase update failed:", err);
    return new Response(`Supabase update failed: ${err.message || err}`, { status: 500 });
  }

  return new Response(JSON.stringify({ customer_id: customer.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});