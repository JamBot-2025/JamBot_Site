import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.16.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { customer_id, price_id, success_url, cancel_url } = await req.json();

  if (!customer_id || !price_id || !success_url || !cancel_url) {
    return new Response("Missing required parameters", { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url,
      cancel_url,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Stripe Checkout Session creation failed:", err);
    return new Response("Stripe Checkout Session creation failed", { status: 500 });
  }
});
