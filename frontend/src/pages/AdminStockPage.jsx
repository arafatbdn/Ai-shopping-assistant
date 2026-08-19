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
    ? <p className="rounded-lg bg-white p-6 text-sm text-[#565959] shadow-sm">Loading stock & fraud tools…</p>
    : error
      ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm lg:col-span-1">
            <div className="flex items-center gap-2 text-amber-900">
              <AlertTriangle size={18} className="text-[#c45500]" />
              <h2 className="font-display text-lg font-bold text-[#0f1111]">Low stock</h2>
            </div>
            <div className="mt-4 space-y-3">
              {dashboard.lowStock.length ? (
                dashboard.lowStock.map((product) => (
                  <div key={product._id} className="flex justify-between text-sm">
                    <span className="font-medium text-[#0f1111]">{product.name}</span>
                    <span className="font-bold text-[#c45500]">{product.stock} left</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#565959]">All products are well stocked.</p>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-[#d5d9d9] bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#FF9900]" />
              <h2 className="font-display text-lg font-bold text-[#0f1111]">Fraud demo</h2>
            </div>
            <p className="mt-1 text-sm text-[#565959]">Run a high-risk order simulation through the business rules engine.</p>
            <button
              onClick={checkFraud}
              className="mt-4 rounded-full border border-[#fcd200] bg-[#ffd814] px-5 py-2 text-sm font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00]"
            >
              Run risk check
            </button>
            {fraud && !fraud.error && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-bold uppercase text-rose-800">{fraud.risk} risk · {fraud.score}/100</p>
                <p className="mt-2 text-xs font-medium text-rose-900">{fraud.flags.join(' · ')}</p>
                <p className="mt-1 text-xs text-rose-700">{fraud.recommendation}</p>
              </div>
            )}
            {fraud?.error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{fraud.error}</p>}
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
