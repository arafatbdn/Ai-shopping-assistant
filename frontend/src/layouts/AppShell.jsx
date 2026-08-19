import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Navigation from '../components/navigation/Navigation.jsx';
import FloatingAgentButton from '../components/navigation/FloatingAgentButton.jsx';

export default function AppShell({ children }) {
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-ink text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_8%,rgba(124,92,255,0.22),transparent_32%),radial-gradient(circle_at_12%_90%,rgba(119,224,195,0.10),transparent_28%)]" />
      <header className="relative z-10 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet shadow-glow">
              <Sparkles size={19} />
            </span>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">AgentShop AI</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">Powered by ShopPilot</p>
            </div>
          </Link>

          <Navigation open={navigationOpen} onToggle={() => setNavigationOpen((isOpen) => !isOpen)} />
        </div>
      </header>
      <main className="relative z-0">{children}</main>
      <FloatingAgentButton />
    </div>
  );
}
