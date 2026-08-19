import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle2, DollarSign, Package, ShieldCheck, Users } from 'lucide-react';
import { generateNotification, getAdminDashboard, runFraudCheck } from '../features/admin/api/adminApi.js';
import ProductUploadForm from '../components/admin/ProductUploadForm.jsx';
import CatalogManager from '../components/admin/CatalogManager.jsx';
import AdminSidebar, { adminSections } from '../components/admin/AdminSidebar.jsx';

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
    return <section className="mx-auto flex min-h-[calc(100vh-81px)] items-center justify-center text-sm text-white/50">Loading admin intelligence…</section>;
  }
  if (error && !dashboard) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-xl flex-col items-center justify-center px-5 text-center">
        <AlertTriangle className="mb-4 text-amber-300" />
        <p className="text-white/70">{error}</p>
      </section>
    );
  }

  const { summary, topProducts, lowStock, sentiment } = dashboard;
  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-mint">AgentShop AI operations</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Admin intelligence</h1>
          <p className="mt-3 text-sm text-white/45">A live view of sales, stock, sentiment, and risk.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-mint/20 bg-mint/10 px-3 py-2 text-xs text-mint">
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
              <Metric label="Total revenue" value={`৳${summary.revenue.toLocaleString('en-BD')}`} icon={DollarSign} />
              <Metric label="Orders" value={summary.totalOrders} icon={Package} accent="text-violet-200" />
              <Metric label="Customers" value={summary.customerCount} icon={Users} accent="text-cyan-200" />
              <Metric label="Average order" value={`৳${summary.averageOrderValue.toLocaleString('en-BD')}`} icon={DollarSign} accent="text-orange-200" />
            </div>
          </Section>

          <Section id="top-sentiment" className="mt-6">
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
                  {topProducts.map((product) => (
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
                  {Object.entries(sentiment).map(([key, value]) => (
                    <div key={key} className="rounded-xl bg-black/10 p-4">
                      <p className="text-xs capitalize text-white/45">{key}</p>
                      <p className="mt-1 font-display text-2xl font-semibold text-mint">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section id="stock-fraud" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5 lg:col-span-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={17} className="text-amber-200" />
                  <h2 className="font-display text-lg font-semibold">Low stock</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {lowStock.length ? (
                    lowStock.map((product) => (
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
                {fraud && (
                  <div className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/10 p-4">
                    <p className="text-sm font-semibold uppercase text-rose-200">{fraud.risk} risk · {fraud.score}/100</p>
                    <p className="mt-2 text-xs text-white/60">{fraud.flags.join(' · ')}</p>
                    <p className="mt-2 text-xs text-white/45">{fraud.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section id="notification" className="mt-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2">
                <Bell size={17} className="text-mint" />
                <h2 className="font-display text-lg font-semibold">Notification generator</h2>
              </div>
              <p className="mt-2 text-sm text-white/45">Generate a customer-ready shipping update using ShopPilot.</p>
              <button onClick={createNotification} className="mt-4 rounded-xl border border-mint/30 bg-mint/10 px-4 py-2.5 text-sm font-semibold text-mint transition hover:bg-mint/20">Generate notification</button>
              {notification && <p className="mt-4 rounded-xl bg-black/10 p-4 text-sm leading-6 text-white/70">{notification.message}</p>}
            </div>
          </Section>
        </div>
      </div>
    </section>
  );
}
