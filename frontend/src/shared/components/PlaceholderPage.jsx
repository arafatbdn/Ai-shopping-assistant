import { Link } from 'react-router-dom';

export default function PlaceholderPage({ title, icon, description }) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-violet/20 text-violet-200">{icon}</div>
      <h1 className="font-display text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-md leading-7 text-white/50">{description}</p>
      <Link to="/" className="mt-8 rounded-full bg-mint px-5 py-3 text-sm font-semibold text-ink transition hover:scale-105">Ask ShopPilot</Link>
    </section>
  );
}
