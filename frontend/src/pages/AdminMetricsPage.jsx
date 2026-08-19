import { DollarSign, Package, Users, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import { useAdminDashboard } from '../features/admin/hooks/useAdminDashboard.js';

function Metric({ label, value, icon: Icon, accent = 'text-[#e47911]' }) {
  return (
    <div className="rounded-xl border border-[#d5d9d9] bg-white p-5 shadow-sm">
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-lg bg-[#f0f2f2] ${accent}`}>
        <Icon size={18} />
      </div>
      <p className="text-xs font-medium text-[#565959]">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-[#0f1111]">{value}</p>
    </div>
  );
}

export default function AdminMetricsPage() {
  const { dashboard, error } = useAdminDashboard();

  if (!dashboard && !error) {
    return (
      <AdminLayout title="Metrics" subtitle="Live business numbers from MongoDB.">
        <p className="rounded-lg bg-white p-6 text-sm text-[#565959] shadow-sm">Loading metrics…</p>
      </AdminLayout>
    );
  }
  if (error) {
    return (
      <AdminLayout title="Metrics" subtitle="Live business numbers from MongoDB.">
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      </AdminLayout>
    );
  }

  const { summary } = dashboard;
  return (
    <AdminLayout
      title="Metrics"
      subtitle="Live business numbers from MongoDB."
      badge={
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 size={14} /> System healthy
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total revenue" value={`৳${summary.revenue.toLocaleString('en-BD')}`} icon={DollarSign} accent="text-[#c45500]" />
        <Metric label="Orders" value={summary.totalOrders} icon={Package} accent="text-[#007185]" />
        <Metric label="Customers" value={summary.customerCount} icon={Users} accent="text-[#131921]" />
        <Metric label="Average order" value={`৳${summary.averageOrderValue.toLocaleString('en-BD')}`} icon={DollarSign} accent="text-[#e47911]" />
      </div>
    </AdminLayout>
  );
}
