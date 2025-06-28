// Simple hash placeholder. Use a secure library in production!
export function hashPassword(password: string): string {
  // In production, use bcrypt or argon2 in your backend
  return btoa(password); // NOT secure, for demo only
}
