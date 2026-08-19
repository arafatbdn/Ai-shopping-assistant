import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { loginUser, registerUser } from '../features/auth/api/authApi.js';
import { useAuth } from '../features/auth/context/AuthProvider.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('demo@nova.shop');
  const [password, setPassword] = useState('NovaDemo123!');
  const [name, setName] = useState('');
  const [registerMode, setRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = registerMode ? await registerUser({ name, email, password }) : await loginUser({ email, password });
      setSession(data);
      navigate(new URLSearchParams(location.search).get('next') || (data.user.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-md items-center px-5 py-14">
      <form onSubmit={submit} className="w-full rounded-[2rem] border border-white/10 bg-[#101e31]/90 p-7 shadow-2xl backdrop-blur-xl">
        <div className="mb-7 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet shadow-glow"><Sparkles size={19} /></span><div><p className="font-display text-lg font-semibold">Sign in to AgentShop AI</p><p className="text-xs text-white/40">Personal shopping and admin access</p></div></div>
        <div className="mb-5 flex rounded-xl border border-white/10 bg-black/10 p-1"><button type="button" onClick={() => setRegisterMode(false)} className={`flex-1 rounded-lg py-2 text-xs ${!registerMode ? 'bg-violet text-white' : 'text-white/45'}`}>Sign in</button><button type="button" onClick={() => setRegisterMode(true)} className={`flex-1 rounded-lg py-2 text-xs ${registerMode ? 'bg-violet text-white' : 'text-white/45'}`}>Create account</button></div>
        {registerMode && <><label className="mb-2 block text-xs font-medium text-white/55">Name</label><input value={name} onChange={(event) => setName(event.target.value)} required={registerMode} className="mb-4 w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none focus:border-violet" /></>}
        <label className="mb-2 block text-xs font-medium text-white/55">Email</label>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mb-4 w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
        <label className="mb-2 block text-xs font-medium text-white/55">Password</label>
        <div className="relative"><LockKeyhole size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" /><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-xl border border-white/10 bg-black/10 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-violet" /></div>
        {error && <p className="mt-4 rounded-xl bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
        <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-ink transition hover:scale-[1.01] disabled:opacity-50">{loading ? 'Please wait…' : registerMode ? 'Create account' : 'Continue'} <ArrowRight size={16} /></button>
        <div className="mt-5 border-t border-white/10 pt-4 text-center"><Link to="/admin/login" className="text-xs font-medium text-violet-200 transition hover:text-mint">Admin login</Link></div>
        <p className="mt-4 text-center text-[11px] text-white/30">Customer demo: demo@nova.shop / NovaDemo123!</p>
      </form>
    </section>
  );
}
