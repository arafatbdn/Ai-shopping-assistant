import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle2, DollarSign, Package, ShieldCheck, Users } from 'lucide-react';
import { generateNotification, getAdminDashboard, runFraudCheck } from '../features/admin/api/adminApi.js';
import ProductUploadForm from '../components/admin/ProductUploadForm.jsx';
import CatalogManager from '../components/admin/CatalogManager.jsx';
import AdminSidebar, { adminSections } from '../components/admin/AdminSidebar.jsx';

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

function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      {children}
    </section>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [fraud, setFraud] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeId, setActiveId] = useState(adminSections[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    getAdminDashboard().then(setDashboard).catch((requestError) => {
      if (requestError.response?.status === 401 || requestError.response?.status === 403) navigate('/admin/login?next=/admin', { replace: true });
      else setError(requestError.response?.data?.message || 'Unable to load dashboard');
    });
  }, [navigate]);

  useEffect(() => {
    const ids = adminSections.map((section) => section.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    ids.forEach((id) => {
      const node = document.getElementById(id);
      if (node) {
        sectionRefs.current[id] = node;
        observer.observe(node);
      }
    });
    return () => observer.disconnect();
  }, [dashboard]);

  const handleSelect = (id) => {
    const node = document.getElementById(id);
    if (!node) return;
    setActiveId(id);
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const checkFraud = async () => {
    try {
      setFraud(await runFraudCheck({ failedPayments: 4, accountAgeDays: 3, orderAmount: 125000, shippingBillingMismatch: true, ordersLastHour: 6 }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Fraud check failed');
    }
  };

  const createNotification = async () => {
    try {
      setNotification(await generateNotification({ customerName: 'Demo Shopper', event: 'your order has shipped', channel: 'push', productName: 'Anker Soundcore Q45' }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Notification generation failed');
    }
  };

  if (!dashboard && !error) {
    return <section className="mx-auto flex min-h-[calc(100vh-81px)] items-center justify-center text-sm text-[#565959]">Loading admin intelligence…</section>;
  }
  if (error && !dashboard) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-xl flex-col items-center justify-center px-5 text-center">
        <AlertTriangle className="mb-4 text-[#c45500]" />
        <p className="text-sm text-rose-800">{error}</p>
      </section>
    );
  }

  const { summary, topProducts, lowStock, sentiment } = dashboard;
  return (
    <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c45500]">AgentShop AI operations</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-[#0f1111] sm:text-4xl">Admin intelligence</h1>
          <p className="mt-1.5 text-sm text-[#565959]">A live view of sales, stock, sentiment, and risk.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 size={14} /> System healthy
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <AdminSidebar activeId={activeId} onSelect={handleSelect} />

        <div className="min-w-0 flex-1">
          <Section id="upload-product">
            <ProductUploadForm onCreated={() => getAdminDashboard().then(setDashboard)} />
          </Section>

          <div className="mt-6">
            <Section id="catalog-manager">
              <CatalogManager onDeleted={() => getAdminDashboard().then(setDashboard)} />
            </Section>
          </div>

          <Section id="metrics" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Total revenue" value={`৳${summary.revenue.toLocaleString('en-BD')}`} icon={DollarSign} accent="text-[#c45500]" />
              <Metric label="Orders" value={summary.totalOrders} icon={Package} accent="text-[#007185]" />
              <Metric label="Customers" value={summary.customerCount} icon={Users} accent="text-[#131921]" />
              <Metric label="Average order" value={`৳${summary.averageOrderValue.toLocaleString('en-BD')}`} icon={DollarSign} accent="text-[#e47911]" />
            </div>
          </Section>

          <Section id="top-sentiment" className="mt-6">
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
                  {topProducts.map((product) => (
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
                  {Object.entries(sentiment).map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-[#eaeded] bg-[#f7f8f8] p-4">
                      <p className="text-xs font-semibold capitalize text-[#565959]">{key}</p>
                      <p className="mt-1 font-display text-2xl font-bold text-[#c45500]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section id="stock-fraud" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm lg:col-span-1">
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle size={18} className="text-[#c45500]" />
                  <h2 className="font-display text-lg font-bold text-[#0f1111]">Low stock</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {lowStock.length ? (
                    lowStock.map((product) => (
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
                {fraud && (
                  <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-bold uppercase text-rose-800">{fraud.risk} risk · {fraud.score}/100</p>
                    <p className="mt-2 text-xs font-medium text-rose-900">{fraud.flags.join(' · ')}</p>
                    <p className="mt-1 text-xs text-rose-700">{fraud.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section id="notification" className="mt-6">
            <div className="rounded-xl border border-[#d5d9d9] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#FF9900]" />
                <h2 className="font-display text-lg font-bold text-[#0f1111]">Notification generator</h2>
              </div>
              <p className="mt-1 text-sm text-[#565959]">Generate a customer-ready shipping update using ShopPilot.</p>
              <button
                onClick={createNotification}
                className="mt-4 rounded-full border border-[#fcd200] bg-[#ffd814] px-5 py-2 text-sm font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00]"
              >
                Generate notification
              </button>
              {notification && <p className="mt-4 rounded-lg border border-[#eaeded] bg-[#f7f8f8] p-4 text-sm leading-6 text-[#0f1111]">{notification.message}</p>}
            </div>
          </Section>
        </div>
      </div>
    </section>
  );
}
