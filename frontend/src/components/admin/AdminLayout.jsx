import AdminSidebar, { adminNavItems } from './AdminSidebar.jsx';

export default function AdminLayout({ title, subtitle, badge, children }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c45500]">AgentShop AI operations</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-[#0f1111] sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[#565959]">{subtitle}</p>}
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