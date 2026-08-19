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
      <form onSubmit={submit} className="w-full rounded-2xl border border-[#d5d9d9] bg-white p-7 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FF9900]/20 text-[#131921]">
            <Sparkles size={20} className="fill-[#FF9900] text-[#FF9900]" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-[#0f1111]">Sign in to AgentShop AI</p>
            <p className="text-xs text-[#565959]">Personal shopping and admin access</p>
          </div>
        </div>
        <div className="mb-5 flex rounded-xl border border-[#d5d9d9] bg-[#f0f2f2] p-1">
          <button
            type="button"
            onClick={() => setRegisterMode(false)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              !registerMode ? 'bg-white text-[#0f1111] shadow-sm' : 'text-[#565959] hover:text-[#0f1111]'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setRegisterMode(true)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              registerMode ? 'bg-white text-[#0f1111] shadow-sm' : 'text-[#565959] hover:text-[#0f1111]'
            }`}
          >
            Create account
          </button>
        </div>
        {registerMode && (
          <>
            <label className="mb-1.5 block text-xs font-semibold text-[#0f1111]">Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required={registerMode}
              className="mb-4 w-full rounded-lg border border-[#d5d9d9] bg-white px-3.5 py-2.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
            />
          </>
        )}
        <label className="mb-1.5 block text-xs font-semibold text-[#0f1111]">Email</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          className="mb-4 w-full rounded-lg border border-[#d5d9d9] bg-white px-3.5 py-2.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
        />
        <label className="mb-1.5 block text-xs font-semibold text-[#0f1111]">Password</label>
        <div className="relative">
          <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888c8c]" />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="w-full rounded-lg border border-[#d5d9d9] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
          />
        </div>
        {error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>}
        <button
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#fcd200] bg-[#ffd814] px-4 py-2.5 text-sm font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00] disabled:opacity-50"
        >
          {loading ? 'Please wait…' : registerMode ? 'Create account' : 'Continue'} <ArrowRight size={16} />
        </button>
        <div className="mt-5 border-t border-[#eaeded] pt-4 text-center">
          <Link to="/admin/login" className="text-xs font-semibold text-[#007185] transition hover:text-[#c45500] hover:underline">
            Admin login
          </Link>
        </div>
        <p className="mt-4 text-center text-[11px] text-[#565959]">Customer demo: demo@nova.shop / NovaDemo123!</p>
      </form>
    </section>
  );
}
