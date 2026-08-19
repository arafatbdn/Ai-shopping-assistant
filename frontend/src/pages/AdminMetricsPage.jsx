import { DollarSign, Package, Users, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import { useAdminDashboard } from '../features/admin/hooks/useAdminDashboard.js';

function Metric({ label, value, icon: Icon, accent = 'text-mint' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className={`mb-4 grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] ${accent}`}>
        <Icon size={17} />
      </div>
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function AdminMetricsPage() {
  const { dashboard, error } = useAdminDashboard();

  if (!dashboard && !error) {
    return (
      <AdminLayout title="Metrics" subtitle="Live business numbers from MongoDB.">
        <p className="rounded-xl bg-black/10 px-4 py-6 text-sm text-white/55">Loading metrics…</p>
      </AdminLayout>
    );
  }
  if (error) {
    return (
      <AdminLayout title="Metrics" subtitle="Live business numbers from MongoDB.">
        <p className="rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>
      </AdminLayout>
    );
  }

  const { summary } = dashboard;
  return (
    <AdminLayout
      title="Metrics"
      subtitle="Live business numbers from MongoDB."
      badge={
        <div className="flex items-center gap-2 rounded-full border border-mint/20 bg-mint/10 px-3 py-2 text-xs text-mint">
          <CheckCircle2 size={14} /> System healthy
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total revenue" value={`৳${summary.revenue.toLocaleString('en-BD')}`} icon={DollarSign} />
        <Metric label="Orders" value={summary.totalOrders} icon={Package} accent="text-violet-200" />
        <Metric label="Customers" value={summary.customerCount} icon={Users} accent="text-cyan-200" />
        <Metric label="Average order" value={`৳${summary.averageOrderValue.toLocaleString('en-BD')}`} icon={DollarSign} accent="text-orange-200" />
      </div>
    </AdminLayout>
  );
}
