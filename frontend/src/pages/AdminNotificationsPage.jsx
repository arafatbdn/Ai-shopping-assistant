import { useState } from 'react';
import { Bell } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import { generateNotification } from '../features/admin/api/adminApi.js';

export default function AdminNotificationsPage() {
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');

  const createNotification = async () => {
    try {
      setNotification(await generateNotification({ customerName: 'Demo Shopper', event: 'your order has shipped', channel: 'push', productName: 'Anker Soundcore Q45' }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Notification generation failed');
    }
  };

  return (
    <AdminLayout
      title="Notification generator"
      subtitle="Compose a customer-ready shipping update using ShopPilot."
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-2">
          <Bell size={17} className="text-mint" />
          <h2 className="font-display text-lg font-semibold">Compose update</h2>
        </div>
        <p className="mt-2 text-sm text-white/45">Generate a customer-ready shipping update using ShopPilot.</p>
        <button onClick={createNotification} className="mt-4 rounded-xl border border-mint/30 bg-mint/10 px-4 py-2.5 text-sm font-semibold text-mint transition hover:bg-mint/20">Generate notification</button>
        {notification && <p className="mt-4 rounded-xl bg-black/10 p-4 text-sm leading-6 text-white/70">{notification.message}</p>}
        {error && <p className="mt-4 rounded-xl bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
      </div>
    </AdminLayout>
  );
}
