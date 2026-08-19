import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Navigation from '../components/navigation/Navigation.jsx';
import FloatingAgentButton from '../components/navigation/FloatingAgentButton.jsx';

export default function AppShell({ children }) {
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eaeded] text-[#0f1111]">
      <header className="sticky top-0 z-40 border-b border-[#232f3e] bg-[#131921] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <Link to="/" className="flex items-center gap-3 transition hover:opacity-95">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FF9900] text-[#131921] shadow-sm">
              <Sparkles size={20} className="fill-[#131921]" />
            </span>
            <div>
              <p className="font-display text-lg font-bold tracking-tight text-white">AgentShop AI</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#f3a847]">Powered by ShopPilot</p>
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
