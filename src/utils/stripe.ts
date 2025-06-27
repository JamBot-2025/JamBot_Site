// This file contains utility functions for Stripe integration
import { loadStripe } from '@stripe/stripe-js';
// Mock implementation for development
// This creates a mock Stripe object that doesn't actually connect to Stripe
const createMockStripe = () => {
  return {
    elements: () => ({
      create: () => ({
        mount: () => {},
        on: () => {},
        unmount: () => {}
      })
    }),
    createPaymentMethod: () => Promise.resolve({
      paymentMethod: {
        id: 'pm_' + Math.random().toString(36).substring(2, 15),
        card: {
          brand: 'visa',
          last4: '4242'
        }
      }
    })
  };
};
// Export a mock Stripe promise for development
export const stripePromise = Promise.resolve(createMockStripe());
// Mock function to create a subscription
export const createSubscription = async (email: string, paymentMethod: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Return a mock successful response
  return {
    success: true,
    subscriptionId: 'sub_' + Math.random().toString(36).substring(2, 15),
    customerId: 'cus_' + Math.random().toString(36).substring(2, 15)
  };
};