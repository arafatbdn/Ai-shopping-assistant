import { ArrowUpRight } from 'lucide-react';
import { assistantSuggestions } from '../../shared/constants/electronics.js';

export default function AssistantHero({ onPromptSelect }) {
  return (
    <div className="max-w-2xl">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3 py-1.5 text-xs font-medium text-mint">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" /> Your personal shopping employee
      </div>
      <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-7xl">
        Shopping that feels <span className="text-mint">understood.</span>
      </h1>
      <p className="mt-7 max-w-xl text-lg leading-8 text-white/55">
        <span className="font-semibold text-white">AgentShop AI</span> &middot; ShopPilot learns what matters to you, finds the right products, and gets things done — from discovery to delivery.
      </p>
      <div className="mt-10 flex flex-wrap gap-2">
        {assistantSuggestions.map((suggestion) => (
          <button key={suggestion} onClick={() => onPromptSelect(suggestion)} className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-left text-xs text-white/65 transition hover:border-violet/60 hover:bg-violet/10 hover:text-white">
            {suggestion}
            <ArrowUpRight size={13} className="text-white/30 transition group-hover:text-mint" />
          </button>
        ))}
      </div>
    </div>
  );
}
