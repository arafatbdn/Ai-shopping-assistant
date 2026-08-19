import { useEffect, useRef } from 'react';
import { Bot, ChevronRight, CircleHelp, Mic, Minus, Send, Sparkles, X } from 'lucide-react';
import useAssistantChat from '../../features/assistant/hooks/useAssistantChat.js';
import { useAssistant } from '../../features/assistant/context/AssistantContext.jsx';
import ProductResults from '../assistant/ProductResults.jsx';
import { formatAssistantMessage } from '../../shared/utils/formatMessage.jsx';

export default function FloatingAgentButton() {
  const { isMinimized, restoreChat, floatingOpen, setFloatingOpen, isHomePage } = useAssistant();
  const messagesEndRef = useRef(null);
  const {
    message,
    updateMessage,
    messages,
    loading,
    error,
    listening,
    toggleVoice,
    voiceLanguage,
    toggleVoiceLanguage,
    submit,
  } = useAssistantChat();

  useEffect(() => {
    if (floatingOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, floatingOpen]);

  const handleButtonClick = () => {
    if (isHomePage && isMinimized) {
      restoreChat();
    } else {
      setFloatingOpen(true);
    }
  };

  if (!floatingOpen) {
    return (
      <button
        onClick={handleButtonClick}
        aria-label="Open ShopPilot Shopping Agent"
        title={isHomePage && isMinimized ? 'Restore ShopPilot chat' : 'Ask ShopPilot'}
        className="fixed bottom-6 right-5 z-50 grid h-14 w-14 place-items-center rounded-full border border-[#FF9900]/50 bg-[#FF9900] text-[#131921] shadow-2xl shadow-black/30 transition hover:scale-110 hover:bg-[#e47911] active:scale-95 sm:bottom-7 sm:right-7"
      >
        <span className={`absolute inset-0 rounded-full bg-[#FF9900]/30 ${isMinimized ? 'animate-ping' : ''}`} />
        <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[#131921]/10">
          <Bot size={22} className="text-[#131921]" />
          <Sparkles size={11} className="absolute right-0.5 top-0.5 fill-[#131921] text-[#131921]" />
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 w-[calc(100vw-2rem)] max-w-[380px] sm:bottom-7 sm:right-7">
      <div className="overflow-hidden rounded-2xl border border-[#232f3e] bg-[#131921] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-[#232f3e] bg-[#131921] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FF9900]/20 text-[#FF9900]">
              <Bot size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-white">ShopPilot · AgentShop AI</p>
              <p className="text-[10px] font-medium text-[#f3a847]">Online · ready to help</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CircleHelp size={15} className="mr-1 text-white/30" />
            <button
              onClick={() => setFloatingOpen(false)}
              aria-label="Minimize ShopPilot chat"
              title="Minimize to icon"
              className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-[#FF9900]"
            >
              <Minus size={17} />
            </button>
            <button
              onClick={() => setFloatingOpen(false)}
              aria-label="Close ShopPilot chat"
              title="Close chat"
              className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="max-h-[min(55vh,420px)] min-h-32 space-y-3 overflow-y-auto bg-[#131921] p-3 [scrollbar-color:rgba(255,153,0,0.5)_transparent] [scrollbar-width:thin]">
          <div className="flex gap-2">
            <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#FF9900]/20 text-[#FF9900]">
              <Sparkles size={12} />
            </span>
            <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-white/10 bg-[#232f3e] px-3.5 py-2.5 text-xs leading-5 text-white/90">
              👋 Hi! I’m <strong className="text-[#FF9900]">ShopPilot</strong> on AgentShop AI. How can I help you shop today?
            </div>
          </div>

          {messages.map((chatMessage) =>
            chatMessage.role === 'user' ? (
              <div
                key={chatMessage.id}
                className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#FF9900] px-3.5 py-2.5 text-xs font-medium leading-5 text-[#0f1111] shadow-sm"
              >
                {chatMessage.content}
              </div>
            ) : (
              <div key={chatMessage.id} className="flex gap-2">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#FF9900]/20 text-[#FF9900]">
                  <Sparkles size={12} />
                </span>
                <div className="max-w-[88%] space-y-2">
                  <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-[#232f3e] px-3.5 py-2.5 text-xs leading-5 text-white/90">
                    {chatMessage.loading ? (
                      <>
                        <span className="typing-dot" /> <span className="typing-dot delay-1" /> <span className="typing-dot delay-2" />
                      </>
                    ) : (
                      formatAssistantMessage(chatMessage.content)
                    )}
                  </div>
                  {!chatMessage.loading && <ProductResults products={chatMessage.products || []} />}
                </div>
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && <p className="border-t border-amber-500/20 bg-amber-500/10 px-4 py-2 text-[10px] text-amber-200">{error}</p>}

        <form onSubmit={submit} className="border-t border-[#232f3e] bg-[#131921] p-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-[#232f3e] bg-[#0f1111]/70 p-1.5 focus-within:border-[#FF9900]">
            <input
              value={message}
              onChange={(event) => updateMessage(event.target.value)}
              placeholder="Ask ShopPilot anything..."
              className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none placeholder:text-white/40"
            />
            <button
              type="button"
              onClick={toggleVoiceLanguage}
              aria-label={`Switch voice language to ${voiceLanguage === 'bn-BD' ? 'English' : 'Bangla'}`}
              className="rounded-md px-1.5 py-1 text-[9px] font-bold text-white/60 transition hover:text-[#FF9900]"
            >
              {voiceLanguage === 'bn-BD' ? 'BN' : 'EN'}
            </button>
            <button
              type="button"
              aria-label="Use voice input"
              onClick={toggleVoice}
              className={`rounded-lg p-2 transition hover:bg-white/10 ${listening ? 'text-[#FF9900]' : 'text-white/50'}`}
            >
              <Mic size={15} />
            </button>
            <button
              type="submit"
              aria-label="Send message"
              disabled={loading}
              className="grid h-8 w-8 place-items-center rounded-lg bg-[#FF9900] text-[#131921] transition hover:bg-[#ffd814] disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
      <button
        onClick={() => setOpen(false)}
        className="mx-auto mt-2 flex items-center gap-1 rounded-full bg-[#131921]/80 px-3 py-1 text-[10px] text-white/60 shadow hover:text-white"
      >
        <ChevronRight size={11} className="rotate-90" /> Minimize to ShopPilot icon
      </button>
    </div>
  );
}
