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
} from 'lucide-react';

const navigationItems = [
  { to: '/', label: 'Assistant', icon: Bot },
  { to: '/orders', label: 'Orders', icon: PackageSearch },
  { to: '/dashboard', label: 'Insights', icon: LayoutDashboard },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
];

export default function Navigation({ open, onToggle }) {
  const { user, signOut } = useAuth();

  return (
    <>
      <nav className={`${open ? 'flex' : 'hidden'} absolute left-5 right-5 top-[68px] z-50 flex-col gap-1.5 rounded-xl border border-[#232f3e] bg-[#131921] p-3 shadow-xl md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
        {navigationItems
          .filter(({ to }) => to !== '/admin' || user?.role === 'admin')
          .map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-[#FF9900]">
              <Icon size={16} />
              {label}
            </Link>
          ))}
      </nav>

      <div className="flex items-center gap-2.5">
        {user ? (
          <button onClick={signOut} title="Sign out" className="hidden items-center gap-2 rounded-lg border border-[#FF9900]/40 bg-[#FF9900]/15 px-3.5 py-1.5 text-sm font-medium text-[#FF9900] transition hover:bg-[#FF9900]/25 sm:flex">
            <UserRound size={16} /> {(user.name ? user.name.replace(/^Nova\s+/i, '') : '') || user.email}
          </button>
        ) : (
          <Link to="/login?next=/" className="hidden items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white transition hover:border-[#FF9900] hover:text-[#FF9900] sm:flex">
            <UserRound size={16} /> Sign in
          </Link>
        )}
        <button aria-label="Toggle navigation" onClick={onToggle} className="rounded-lg border border-white/15 p-2 text-white transition hover:text-[#FF9900] md:hidden">
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </>
  );
}
