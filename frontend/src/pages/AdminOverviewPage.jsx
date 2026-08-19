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
        <div className="flex items-center gap-2 rounded-full border border-mint/20 bg-mint/10 px-3 py-2 text-xs text-mint">
          <CheckCircle2 size={14} /> System healthy
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overviewCards.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-mint/40 hover:bg-white/[0.06]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint/10 text-mint transition group-hover:scale-110">
              <Icon size={17} />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold">{title}</h3>
              <p className="mt-1 text-xs text-white/45">{description}</p>
            </div>
            <span className="mt-auto text-xs font-medium text-mint opacity-0 transition group-hover:opacity-100">Open →</span>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
