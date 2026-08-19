import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronRight, CircleHelp, Mic, Send, Sparkles, X } from 'lucide-react';
import useAssistantChat from '../../features/assistant/hooks/useAssistantChat.js';
import ProductResults from '../assistant/ProductResults.jsx';
import { formatAssistantMessage } from '../../shared/utils/formatMessage.jsx';

export default function FloatingAgentButton() {
  const [open, setOpen] = useState(false);
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
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  if (!open) {
    return <button onClick={() => setOpen(true)} aria-label="Open ShopPilot Shopping Agent" title="Ask ShopPilot" className="fixed bottom-6 right-5 z-50 grid h-14 w-14 place-items-center rounded-full border border-violet-300/30 bg-violet text-white shadow-2xl shadow-violet/30 transition hover:scale-105 hover:bg-violet/90 sm:bottom-7 sm:right-7"><span className="absolute inset-0 animate-ping rounded-full bg-violet/30" /><span className="relative grid h-10 w-10 place-items-center rounded-full bg-white/10"><Bot size={21} /><Sparkles size={10} className="absolute right-1 top-1 text-mint" /></span></button>;
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 w-[calc(100vw-2rem)] max-w-[380px] sm:bottom-7 sm:right-7">
      <div className="overflow-hidden rounded-3xl border border-white/15 bg-[#101e31]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet/25 text-violet-100"><Bot size={18} /></span><div><p className="text-sm font-semibold">ShopPilot · AgentShop AI</p><p className="text-[10px] text-mint">Online · ready to help</p></div></div><div className="flex items-center gap-1"><CircleHelp size={15} className="mr-1 text-white/25" /><button onClick={() => setOpen(false)} aria-label="Close ShopPilot chat" className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"><X size={17} /></button></div></div>
        <div className="max-h-[min(55vh,420px)] min-h-32 space-y-3 overflow-y-auto p-3 [scrollbar-color:rgba(119,224,195,0.55)_transparent] [scrollbar-width:thin]">
          <div className="flex gap-2"><span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-violet/20 text-violet-100"><Sparkles size={12} /></span><div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white/[0.07] px-3 py-2 text-xs leading-5 text-white/70">👋 Hi! I’m **ShopPilot** on AgentShop AI. How can I help you shop today?</div></div>
          {messages.map((chatMessage) => chatMessage.role === 'user' ? <div key={chatMessage.id} className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-violet px-3 py-2 text-xs leading-5 text-white">{chatMessage.content}</div> : <div key={chatMessage.id} className="flex gap-2"><span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-violet/20 text-violet-100"><Sparkles size={12} /></span><div className="max-w-[88%] space-y-2"><div className="rounded-2xl rounded-tl-sm bg-white/[0.07] px-3 py-2 text-xs leading-5 text-white/70">{chatMessage.loading ? <><span className="typing-dot" /> <span className="typing-dot delay-1" /> <span className="typing-dot delay-2" /></> : formatAssistantMessage(chatMessage.content)}</div>{!chatMessage.loading && <ProductResults products={chatMessage.products || []} />}</div></div>)}
          <div ref={messagesEndRef} />
        </div>
        {error && <p className="border-t border-amber-200/10 px-4 py-2 text-[10px] text-amber-200/70">{error}</p>}
        <form onSubmit={submit} className="border-t border-white/10 p-3"><div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/10 p-1.5 focus-within:border-violet/60"><input value={message} onChange={(event) => updateMessage(event.target.value)} placeholder="Ask ShopPilot anything..." className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none placeholder:text-white/30" /><button type="button" onClick={toggleVoiceLanguage} aria-label={`Switch voice language to ${voiceLanguage === 'bn-BD' ? 'English' : 'Bangla'}`} className="rounded-md px-1 py-1 text-[9px] font-semibold text-white/45 hover:text-mint">{voiceLanguage === 'bn-BD' ? 'BN' : 'EN'}</button><button type="button" aria-label="Use voice input" onClick={toggleVoice} className={`rounded-lg p-2 transition hover:bg-white/10 ${listening ? 'text-mint' : 'text-white/40'}`}><Mic size={15} /></button><button type="submit" aria-label="Send message" disabled={loading} className="grid h-8 w-8 place-items-center rounded-lg bg-mint text-ink transition hover:brightness-110 disabled:opacity-50"><Send size={14} /></button></div></form>
      </div>
      <button onClick={() => setOpen(false)} className="mx-auto mt-2 flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-[10px] text-white/45 backdrop-blur hover:text-white"><ChevronRight size={11} className="rotate-90" /> Minimize to ShopPilot icon</button>
    </div>
  );
}
