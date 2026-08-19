import { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import AssistantChatCard from '../components/assistant/AssistantChatCard.jsx';
import AssistantHero from '../components/assistant/AssistantHero.jsx';
import CategoryGrid from '../components/assistant/CategoryGrid.jsx';
import CategoryProducts from '../components/assistant/CategoryProducts.jsx';
import { useAssistant } from '../features/assistant/context/AssistantContext.jsx';

export default function AssistantPage() {
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isMinimized, minimizeChat, restoreChat } = useAssistant();

  const selectSuggestion = (prompt) => {
    if (isMinimized) restoreChat();
    setAutoSubmit(false);
    setSelectedPrompt(prompt);
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
        <AssistantHero onPromptSelect={selectSuggestion} />
        {isMinimized ? (
          <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center rounded-2xl border border-dashed border-[#d5d9d9] bg-white/80 p-8 text-center shadow-sm backdrop-blur-xs transition hover:border-[#FF9900]">
            <div className="relative mb-3.5 grid h-14 w-14 place-items-center rounded-full bg-[#FF9900] text-[#131921] shadow-lg shadow-[#FF9900]/30 transition hover:scale-105">
              <Bot size={24} />
              <Sparkles size={12} className="absolute right-1 top-1 fill-[#131921] text-[#131921]" />
            </div>
            <h3 className="font-display text-base font-bold text-[#0f1111]">ShopPilot is minimized</h3>
            <p className="mt-1 max-w-xs text-xs text-[#565959]">
              Click the floating bot icon in the bottom-right corner or click below to continue chatting.
            </p>
            <button
              onClick={restoreChat}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#fcd200] bg-[#ffd814] px-5 py-2 text-xs font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00] active:scale-95"
            >
              <Bot size={14} /> Open ShopPilot Chat
            </button>
          </div>
        ) : (
          <AssistantChatCard
            selectedPrompt={selectedPrompt}
            autoSubmit={autoSubmit}
            onMinimize={minimizeChat}
          />
        )}
      </section>
      <CategoryGrid onCategorySelect={selectCategory} />
      <CategoryProducts category={selectedCategory} />
    </>
  );
}
