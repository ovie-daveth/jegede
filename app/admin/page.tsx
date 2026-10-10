import { requireChatGPTUser } from '../chatgpt-auth';
import {bindings} from '../api/helpers';
import Admin from './panel';
export const dynamic='force-dynamic';
export default async function Page(){const u=await requireChatGPTUser('/admin');const allowed=(bindings().ADMIN_EMAILS||'michealjegede3@gmail.com').toLowerCase().split(',').map(s=>s.trim()).includes(u.email.toLowerCase());if(!allowed)return <main className="access"><a href="/">← Portfolio</a><h1>Administrator access</h1><p>Sign in using Micheal’s authorised account ({'michealjegede3@gmail.com'}) to manage the portfolio.</p><a className="button" target="_top" href="/signout-with-chatgpt?return_to=/admin">Switch account</a></main>;return <Admin/>;}
