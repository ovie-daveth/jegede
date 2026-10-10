import { redirect } from "next/navigation";
import { currentUser } from "../../lib/auth";
import { adminEmailAllowed } from "../../lib/config";
import Admin from "./panel";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!adminEmailAllowed(user.email))
    return (
      <main className="access">
        <a href="/">← Portfolio</a>
        <h1>Administrator access required</h1>
        <p>This account is not authorised to manage the portfolio.</p>
      </main>
    );
  return <Admin />;
}
