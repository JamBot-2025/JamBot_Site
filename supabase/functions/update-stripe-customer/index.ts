// Edge Function: update-stripe-customer
// Updates Stripe customer name and/or email for the authenticated user
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { stripe_customer_id, name, email } = body;
  if (!stripe_customer_id || (!name && !email)) {
    return new Response("Missing required fields", { status: 400 });
  }

  const stripeApiKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeApiKey) {
    return new Response("Stripe secret key not set", { status: 500 });
  }

  // Prepare payload for Stripe update
  const payload = new URLSearchParams();
  if (name) payload.append("name", name);
  if (email) payload.append("email", email);

  const stripeRes = await fetch(`https://api.stripe.com/v1/customers/${stripe_customer_id}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${stripeApiKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: payload.toString()
  });

  if (!stripeRes.ok) {
    const err = await stripeRes.text();
    return new Response(`Stripe error: ${err}`, { status: 500 });
  }

  const updatedCustomer = await stripeRes.json();
  return new Response(JSON.stringify({ success: true, customer: updatedCustomer }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
