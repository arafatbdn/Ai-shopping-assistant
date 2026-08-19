import { Link } from 'react-router-dom';

export default function PlaceholderPage({ title, icon, description }) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#FF9900]/20 text-[#131921]">{icon}</div>
      <h1 className="font-display text-4xl font-bold tracking-tight text-[#0f1111]">{title}</h1>
      <p className="mt-3 max-w-md leading-7 text-[#565959]">{description}</p>
      <Link
        to="/"
        className="mt-6 rounded-full border border-[#fcd200] bg-[#ffd814] px-6 py-2.5 text-sm font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00]"
      >
        Ask ShopPilot
      </Link>
    </section>
  );
}
