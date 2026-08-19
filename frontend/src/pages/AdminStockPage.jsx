import { useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import { runFraudCheck } from '../features/admin/api/adminApi.js';
import { useAdminDashboard } from '../features/admin/hooks/useAdminDashboard.js';

export default function AdminStockPage() {
  const { dashboard, error } = useAdminDashboard();
  const [fraud, setFraud] = useState(null);

  const checkFraud = async () => {
    try {
      setFraud(await runFraudCheck({ failedPayments: 4, accountAgeDays: 3, orderAmount: 125000, shippingBillingMismatch: true, ordersLastHour: 6 }));
    } catch (requestError) {
      setFraud({ error: requestError.response?.data?.message || 'Fraud check failed' });
    }
  };

  const inner = !dashboard && !error
    ? <p className="rounded-xl bg-black/10 px-4 py-6 text-sm text-white/55">Loading stock & fraud tools…</p>
    : error
      ? <p className="rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>
      : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5 lg:col-span-1">
            <div className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-amber-200" />
              <h2 className="font-display text-lg font-semibold">Low stock</h2>
            </div>
            <div className="mt-4 space-y-3">
              {dashboard.lowStock.length ? (
                dashboard.lowStock.map((product) => (
                  <div key={product._id} className="flex justify-between text-sm">
                    <span className="text-white/70">{product.name}</span>
                    <span className="font-semibold text-amber-200">{product.stock} left</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/40">All products are well stocked.</p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:col-span-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-violet-200" />
              <h2 className="font-display text-lg font-semibold">Fraud demo</h2>
            </div>
            <p className="mt-2 text-sm text-white/45">Run a high-risk order simulation through the business rules engine.</p>
            <button onClick={checkFraud} className="mt-4 rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold transition hover:scale-[1.02]">Run risk check</button>
            {fraud && !fraud.error && (
              <div className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/10 p-4">
                <p className="text-sm font-semibold uppercase text-rose-200">{fraud.risk} risk · {fraud.score}/100</p>
                <p className="mt-2 text-xs text-white/60">{fraud.flags.join(' · ')}</p>
                <p className="mt-2 text-xs text-white/45">{fraud.recommendation}</p>
              </div>
            )}
            {fraud?.error && <p className="mt-4 rounded-xl bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{fraud.error}</p>}
          </div>
        </div>
      );

  return (
    <AdminLayout
      title="Low stock & fraud"
      subtitle="Watch catalog health and run risk simulations."
    >
      {inner}
    </AdminLayout>
  );
}
