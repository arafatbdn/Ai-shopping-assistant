import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthProvider.jsx';
import {
  Bot,
  LayoutDashboard,
  Menu,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../../shared/theme/ThemeProvider.jsx';

const navigationItems = [
  { to: '/', label: 'Assistant', icon: Bot },
  { to: '/orders', label: 'Orders', icon: PackageSearch },
  { to: '/dashboard', label: 'Insights', icon: LayoutDashboard },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
];

export default function Navigation({ open, onToggle }) {
  const { user, signOut } = useAuth();
  const { isLight, toggleTheme } = useTheme();

  return (
    <>
      <nav className={`${open ? 'flex' : 'hidden'} absolute left-5 right-5 top-[76px] flex-col gap-2 rounded-2xl border border-white/10 bg-[#0d1a2c] p-3 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}>
        {navigationItems
          .filter(({ to }) => to !== '/admin' || user?.role === 'admin')
          .map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white/55 transition hover:bg-white/10 hover:text-white">
              <Icon size={16} />
              {label}
            </Link>
          ))}
      </nav>

      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'} title={isLight ? 'Dark mode' : 'White mode'} className="rounded-xl border border-white/10 p-2 text-white/60 transition hover:bg-white/10 hover:text-white">
          {isLight ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        {user ? (
          <button onClick={signOut} title="Sign out" className="hidden items-center gap-2 rounded-full border border-mint/20 bg-mint/10 px-4 py-2 text-sm text-mint transition hover:border-mint/40 sm:flex">
            <UserRound size={16} /> {user.name || user.email}
          </button>
        ) : (
          <Link to="/login?next=/" className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/25 hover:text-white sm:flex">
            <UserRound size={16} /> Sign in
          </Link>
        )}
        <button aria-label="Toggle navigation" onClick={onToggle} className="rounded-xl border border-white/10 p-2 md:hidden">
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </>
  );
}
