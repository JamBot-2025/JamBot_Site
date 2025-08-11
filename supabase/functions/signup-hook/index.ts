import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.16.0?target=deno";
import { processSignup } from "./lib.ts";

//FUNCTIONALITY: Creates a new profile  row into Supabase.

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

// After changing back to live, delete current user data from profiles table inorder to update stripe_customer_id
const stripe = new Stripe(Deno.env.get("STRIPE_TEST_SECRET_KEY")!, { 
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

  // Import the Supabase client
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.7");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Delegate to shared helper for consistent behavior and testable logic
  const result = await processSignup(
    { id, email, name },
    { stripe: stripe as any, supabase: supabase as any }
  );

  if (!result.ok) {
    const where = (result as any).error?.where;
    console.error(`[signup-hook] ${where} error:`, (result as any).error?.err);
    return withCorsHeaders(new Response("Signup processing failed", { status: 500 }));
  }

  return withCorsHeaders(new Response("Success", { status: 200 }));
});
