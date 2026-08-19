import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { loginUser } from '../features/auth/api/authApi.js';
import { useAuth } from '../features/auth/context/AuthProvider.jsx';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('admin@nova.shop');
  const [password, setPassword] = useState('NovaDemo123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser({ email, password });
      if (data.user.role !== 'admin') {
        setError('This account does not have admin access.');
        return;
      }
      setSession(data);
      navigate(new URLSearchParams(location.search).get('next') || '/admin', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in as admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-md items-center px-5 py-14">
      <form onSubmit={submit} className="w-full rounded-[2rem] border border-white/10 bg-[#101e31]/90 p-7 shadow-2xl backdrop-blur-xl">
        <div className="mb-7 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet shadow-glow"><ShieldCheck size={19} /></span><div><p className="font-display text-lg font-semibold">Admin login</p><p className="text-xs text-white/40">AgentShop AI operations dashboard access</p></div></div>
        <label className="mb-2 block text-xs font-medium text-white/55">Admin email</label>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mb-4 w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
        <label className="mb-2 block text-xs font-medium text-white/55">Password</label>
        <div className="relative"><LockKeyhole size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" /><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="w-full rounded-xl border border-white/10 bg-black/10 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-violet" /></div>
        {error && <p className="mt-4 rounded-xl bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
        <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-ink transition hover:scale-[1.01] disabled:opacity-50">{loading ? 'Please wait…' : 'Admin login'} <ArrowRight size={16} /></button>
        <div className="mt-5 border-t border-white/10 pt-4 text-center"><Link to="/login" className="text-xs font-medium text-violet-200 transition hover:text-mint">← Customer login</Link></div>
        <p className="mt-4 text-center text-[11px] text-white/30">Demo admin: admin@nova.shop / NovaDemo123!</p>
      </form>
    </section>
  );
}
