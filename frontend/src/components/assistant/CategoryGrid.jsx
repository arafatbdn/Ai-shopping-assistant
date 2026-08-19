import { electronicsCategories } from '../../shared/constants/electronics.js';

export default function CategoryGrid({ onCategorySelect }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-14 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-mint">Browse by interest</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">Explore electronics</h2>
        </div>
        <span className="hidden text-xs text-white/35 sm:block">Ask ShopPilot to find the perfect match</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {electronicsCategories.map((cat) => (
          <button key={cat.name} onClick={() => onCategorySelect(cat)} className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${cat.color} p-4 text-left transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/10`}>
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-black/30 text-white/80 shadow-inner transition group-hover:text-mint">
              <cat.icon size={19} className={cat.image ? 'opacity-0' : 'opacity-100'} />
              {cat.image && (
                <img
                  src={cat.image}
                  alt={`${cat.name} sample`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.remove();
                    const sibling = event.currentTarget.previousElementSibling;
                    if (sibling) sibling.classList.remove('opacity-0');
                  }}
                />
              )}
            </span>
            <span className="mt-4 block text-sm font-medium text-white/80">{cat.name}</span>
            <span className="mt-1 block text-[11px] text-white/35">Shop now</span>
            {cat.image && (
              <img
                src={cat.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full object-cover opacity-25 blur-[2px] transition group-hover:opacity-40 group-hover:scale-110"
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
