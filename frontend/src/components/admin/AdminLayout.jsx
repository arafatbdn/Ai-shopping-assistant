import AdminSidebar, { adminNavItems } from './AdminSidebar.jsx';

export default function AdminLayout({ title, subtitle, badge, children }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-mint">AgentShop AI operations</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-3 text-sm text-white/45">{subtitle}</p>}
        </div>
        {badge}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}

export { adminNavItems };