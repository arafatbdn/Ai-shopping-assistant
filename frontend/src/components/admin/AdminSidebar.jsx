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
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-max lg:w-64 lg:flex-shrink-0">
      <nav className="rounded-xl border border-[#d5d9d9] bg-white p-3 shadow-sm">
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#565959]">
          Admin sections
        </p>
        <ul className="space-y-1">
          {adminNavItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                    isActive
                      ? 'border-[#FF9900]/50 bg-[#fff8ee] text-[#c45500] font-bold'
                      : 'border-transparent text-[#565959] hover:bg-[#f0f2f2] hover:text-[#0f1111]'
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
