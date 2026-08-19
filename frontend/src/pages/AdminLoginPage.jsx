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
      <form onSubmit={submit} className="w-full rounded-2xl border border-[#d5d9d9] bg-white p-7 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#131921] text-[#FF9900]">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-[#0f1111]">Admin login</p>
            <p className="text-xs text-[#565959]">AgentShop AI operations dashboard access</p>
          </div>
        </div>
        <label className="mb-1.5 block text-xs font-semibold text-[#0f1111]">Admin email</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          className="mb-4 w-full rounded-lg border border-[#d5d9d9] bg-white px-3.5 py-2.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
        />
        <label className="mb-1.5 block text-xs font-semibold text-[#0f1111]">Password</label>
        <div className="relative">
          <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888c8c]" />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            className="w-full rounded-lg border border-[#d5d9d9] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
          />
        </div>
        {error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>}
        <button
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#fcd200] bg-[#ffd814] px-4 py-2.5 text-sm font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00] disabled:opacity-50"
        >
          {loading ? 'Please wait…' : 'Admin login'} <ArrowRight size={16} />
        </button>
        <div className="mt-5 border-t border-[#eaeded] pt-4 text-center">
          <Link to="/login" className="text-xs font-semibold text-[#007185] transition hover:text-[#c45500] hover:underline">
            ← Customer login
          </Link>
        </div>
        <p className="mt-4 text-center text-[11px] text-[#565959]">Demo admin: admin@nova.shop / NovaDemo123!</p>
      </form>
    </section>
  );
}
