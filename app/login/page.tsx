import LoginForm from "./form";
import { supabaseConfigured } from "../../lib/config";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <main className="loginwrap">
      <a href="/" className="wordmark">
        <span className="monogram">
          MJ<span>·</span>
        </span>
        <span>PORTFOLIO STUDIO</span>
      </a>
      <div className="loginbox">
        <p className="eyebrow">ADMINISTRATOR ACCESS</p>
        <h1>Welcome back.</h1>
        <p>Sign in to manage your engineering portfolio.</p>
        {supabaseConfigured() ? (
          <LoginForm />
        ) : (
          <p className="alert error">
            Supabase is not configured yet. Follow the deployment guide in the
            repository to enable admin sign-in.
          </p>
        )}
      </div>
      <a className="textlink" href="/">
        ← Return to portfolio
      </a>
    </main>
  );
}
