import { Package, Users } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import { useAdminDashboard } from '../features/admin/hooks/useAdminDashboard.js';

export default function AdminInsightsPage() {
  const { dashboard, error } = useAdminDashboard();

  const inner = !dashboard && !error
    ? <p className="rounded-xl bg-black/10 px-4 py-6 text-sm text-white/55">Loading insights…</p>
    : error
      ? <p className="rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>
      : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Top products</h2>
                <p className="mt-1 text-xs text-white/40">Popularity and catalog performance</p>
              </div>
              <Package size={18} className="text-white/30" />
            </div>
            <div className="space-y-3">
              {dashboard.topProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-white/80">{product.name}</p>
                    <p className="mt-1 text-[11px] text-white/35">{product.brand} · ★ {product.rating} · {product.reviewCount} reviews</p>
                  </div>
                  <span className="text-sm font-semibold text-mint">৳{product.price.toLocaleString('en-BD')}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Customer sentiment</h2>
                <p className="mt-1 text-xs text-white/40">Review emotion signals</p>
              </div>
              <Users size={18} className="text-white/30" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(dashboard.sentiment).map(([key, value]) => (
                <div key={key} className="rounded-xl bg-black/10 p-4">
                  <p className="text-xs capitalize text-white/45">{key}</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-mint">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

  return (
    <AdminLayout
      title="Top products & sentiment"
      subtitle="Catalog performance and customer emotion signals."
    >
      {inner}
    </AdminLayout>
  );
}
