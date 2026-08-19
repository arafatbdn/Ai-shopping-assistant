import { Link } from 'react-router-dom';
import { CheckCircle2, ImagePlus, PackageSearch, BarChart3, ShieldCheck, Bell } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout.jsx';

const overviewCards = [
  { to: '/admin/upload', icon: ImagePlus, title: 'Upload product', description: 'Save catalog details and an image to MongoDB.' },
  { to: '/admin/catalog', icon: PackageSearch, title: 'Catalog manager', description: 'Browse and remove products, cleaning up carts, wishlists, and orders.' },
  { to: '/admin/metrics', icon: BarChart3, title: 'Metrics', description: 'Live revenue, orders, customer counts, and average order value.' },
  { to: '/admin/insights', icon: PackageSearch, title: 'Top products & sentiment', description: 'Catalog performance alongside customer review emotion signals.' },
  { to: '/admin/stock', icon: ShieldCheck, title: 'Low stock & fraud', description: 'Watch inventory health and run business-rule risk simulations.' },
  { to: '/admin/notifications', icon: Bell, title: 'Notification generator', description: 'Compose customer-ready updates powered by ShopPilot.' },
];

export default function AdminOverviewPage() {
  return (
    <AdminLayout
      title="Admin intelligence"
      subtitle="Pick a section from the sidebar or jump in below."
      badge={
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 size={14} /> System healthy
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overviewCards.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col gap-3 rounded-xl border border-[#d5d9d9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF9900] hover:shadow-md"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f0f2f2] text-[#131921] transition group-hover:bg-[#fff8ee] group-hover:text-[#e47911]">
              <Icon size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#0f1111]">{title}</h3>
              <p className="mt-1 text-xs text-[#565959]">{description}</p>
            </div>
            <span className="mt-auto text-xs font-bold text-[#007185] opacity-0 transition group-hover:opacity-100 group-hover:text-[#c45500]">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
