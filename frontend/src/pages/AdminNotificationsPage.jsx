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
      <div className="rounded-xl border border-[#d5d9d9] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-[#FF9900]" />
          <h2 className="font-display text-lg font-bold text-[#0f1111]">Compose update</h2>
        </div>
        <p className="mt-1 text-sm text-[#565959]">Generate a customer-ready shipping update using ShopPilot.</p>
        <button
          onClick={createNotification}
          className="mt-4 rounded-full border border-[#fcd200] bg-[#ffd814] px-5 py-2 text-sm font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00]"
        >
          Generate notification
        </button>
        {notification && <p className="mt-4 rounded-lg border border-[#eaeded] bg-[#f7f8f8] p-4 text-sm leading-6 text-[#0f1111]">{notification.message}</p>}
        {error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-800">{error}</p>}
      </div>
    </AdminLayout>
  );
}
