import { electronicsCategories } from '../../shared/constants/electronics.js';

export default function CategoryGrid({ onCategorySelect }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-14 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c45500]">Browse by interest</p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#0f1111] sm:text-3xl">Explore electronics</h2>
        </div>
        <span className="hidden text-xs text-[#565959] sm:block">Ask ShopPilot to find the perfect match</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {electronicsCategories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onCategorySelect(cat)}
            className="group relative overflow-hidden rounded-xl border border-[#d5d9d9] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF9900] hover:shadow-md"
          >
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-[#f0f2f2] text-[#131921] transition group-hover:bg-[#fff8ee] group-hover:text-[#e47911]">
              <cat.icon size={20} className={cat.image ? 'opacity-0' : 'opacity-100'} />
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
            <span className="mt-3 block text-sm font-bold text-[#0f1111]">{cat.name}</span>
            <span className="mt-0.5 block text-[11px] font-medium text-[#565959] group-hover:text-[#e47911]">Shop now</span>
            {cat.image && (
              <img
                src={cat.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full object-cover opacity-15 blur-[2px] transition group-hover:opacity-25 group-hover:scale-110"
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
