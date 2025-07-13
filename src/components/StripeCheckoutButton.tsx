import React from "react";

interface StripeCheckoutButtonProps {
  customerId: string;
  priceId: string;
}

export const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({ customerId, priceId }) => {
  const handleCheckout = async () => {
    try {
      const response = await fetch(
        "https://mcsqxmsvyckabbgefixy.functions.supabase.co/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_id: customerId,
            price_id: priceId,
            success_url: window.location.origin + "/success",
            cancel_url: window.location.origin + "/cancel",
          }),
        }
      );
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create Stripe Checkout Session.");
      }
    } catch (error) {
      alert("Error redirecting to Stripe Checkout.");
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
    >
      Subscribe with Stripe
    </button>
  );
};
