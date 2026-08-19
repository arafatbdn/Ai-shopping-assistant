import { Package, Users } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import { useAdminDashboard } from '../features/admin/hooks/useAdminDashboard.js';

export default function AdminInsightsPage() {
  const { dashboard, error } = useAdminDashboard();

  const inner = !dashboard && !error
    ? <p className="rounded-lg bg-white p-6 text-sm text-[#565959] shadow-sm">Loading insights…</p>
    : error
      ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-[#d5d9d9] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0f1111]">Top products</h2>
                <p className="mt-0.5 text-xs text-[#565959]">Popularity and catalog performance</p>
              </div>
              <Package size={18} className="text-[#888c8c]" />
            </div>
            <div className="space-y-3">
              {dashboard.topProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between rounded-lg border border-[#eaeded] bg-[#f7f8f8] px-3.5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0f1111]">{product.name}</p>
                    <p className="mt-0.5 text-[11px] text-[#565959]">{product.brand} · <span className="font-semibold text-[#e47911]">★ {product.rating}</span> · {product.reviewCount} reviews</p>
                  </div>
                  <span className="text-sm font-bold text-[#0f1111]">৳{product.price.toLocaleString('en-BD')}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#d5d9d9] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0f1111]">Customer sentiment</h2>
                <p className="mt-0.5 text-xs text-[#565959]">Review emotion signals</p>
              </div>
              <Users size={18} className="text-[#888c8c]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(dashboard.sentiment).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-[#eaeded] bg-[#f7f8f8] p-4">
                  <p className="text-xs font-semibold capitalize text-[#565959]">{key}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#c45500]">{value}</p>
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
