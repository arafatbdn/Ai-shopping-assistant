import { ArrowUpRight } from 'lucide-react';
import { assistantSuggestions } from '../../shared/constants/electronics.js';

export default function AssistantHero({ onPromptSelect }) {
  return (
    <div className="max-w-2xl">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF9900]/30 bg-[#FF9900]/10 px-3.5 py-1.5 text-xs font-semibold text-[#c45500]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF9900]" /> Your personal shopping employee
      </div>
      <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight text-[#0f1111] sm:text-7xl">
        Shopping that feels <span className="text-[#e47911]">understood.</span>
      </h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-[#565959] sm:text-lg">
        <strong className="font-semibold text-[#0f1111]">AgentShop AI</strong> &middot; ShopPilot learns what matters to you, finds the right products, and gets things done — from discovery to delivery.
      </p>
      <div className="mt-8 flex flex-wrap gap-2.5">
        {assistantSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onPromptSelect(suggestion)}
            className="group flex items-center gap-2 rounded-full border border-[#d5d9d9] bg-white px-4 py-2 text-left text-xs font-medium text-[#0f1111] shadow-sm transition hover:border-[#FF9900] hover:bg-[#fffbf2] hover:text-[#0f1111]"
          >
            {suggestion}
            <ArrowUpRight size={13} className="text-[#888c8c] transition group-hover:text-[#e47911]" />
          </button>
        ))}
      </div>
    </div>
  );
}
