// Placeholder for sending verification email
export async function sendVerificationEmail(email: string, token: string) {
  // In production, call your backend or an email API (e.g. SendGrid, Resend, etc.)
  // The link should point to your verification endpoint, e.g. /api/verify?token=...
  console.log(`Send verification to ${email} with token: ${token}`);
  // Example: await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ email, token }) });
}
