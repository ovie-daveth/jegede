export function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
export function supabaseConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
export function adminEmailAllowed(email?: string | null) {
  return (
    !!email &&
    (process.env.ADMIN_EMAILS || "michealjegede3@gmail.com")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .includes(email.toLowerCase())
  );
}
