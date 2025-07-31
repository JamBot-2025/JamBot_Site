import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

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
    if (!userId || !email) {
      return withCorsHeaders(new Response(JSON.stringify({ error: "Missing userId or email" }), { status: 400 }));
    }

    // 1. Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;

    // 2. If no Stripe customer, create one and update profile
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId }
      });
      stripeCustomerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", userId);
    }

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        { price: Deno.env.get("STRIPE_TEST_PRICE_ID"), quantity: 1 }
      ],
      //Change these to match eventual site name//
      success_url: "http://localhost:5173/account?success=true",
      cancel_url: "http://localhost:5173/subscribe"
    });

    return withCorsHeaders(new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" }
    }));
  } catch (err) {
    console.error("[create-checkout-session] Error:", err);
    return withCorsHeaders(new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 }));
  }
});
