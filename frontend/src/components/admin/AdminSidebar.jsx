import { NavLink } from 'react-router-dom';
import { ImagePlus, PackageSearch, LayoutDashboard, ShieldCheck, Bell, BarChart3 } from 'lucide-react';

export const adminNavItems = [
  { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/upload', label: 'Upload product', icon: ImagePlus },
  { to: '/admin/catalog', label: 'Catalog manager', icon: PackageSearch },
  { to: '/admin/metrics', label: 'Metrics', icon: BarChart3 },
  { to: '/admin/insights', label: 'Top products & sentiment', icon: PackageSearch },
  { to: '/admin/stock', label: 'Low stock & fraud', icon: ShieldCheck },
  { to: '/admin/notifications', label: 'Notification generator', icon: Bell },
];

export default function AdminSidebar() {
  return (
    <aside className="hidden lg:block lg:sticky lg:top-24 lg:h-max lg:w-64 lg:flex-shrink-0">
      <nav className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
          Admin sections
        </p>
        <ul className="space-y-1">
          {adminNavItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    isActive
                      ? 'border-mint/30 bg-mint/10 text-mint'
                      : 'border-transparent text-white/60 hover:bg-white/[0.06] hover:text-white'
                  }`
                }
              >
                <Icon size={16} className="shrink-0" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
