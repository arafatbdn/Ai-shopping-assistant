import {
  Bot,
  ChevronRight,
  CircleHelp,
  Mic,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import useAssistantChat from '../../features/assistant/hooks/useAssistantChat.js';
import AssistantStatusPill from '../../features/assistant/components/AssistantStatusPill.jsx';
import ProductResults from './ProductResults.jsx';
import { formatAssistantMessage } from '../../shared/utils/formatMessage.jsx';

export default function AssistantChatCard({ selectedPrompt, autoSubmit }) {
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
    voiceOutputEnabled,
    toggleVoiceOutput,
    stopSpeaking,
    speaking,
    ttsSupported,
  } = useAssistantChat(selectedPrompt, autoSubmit);

  return (
    <div id="shoppilot-agent-chat" className="relative mx-auto w-full max-w-xl scroll-mt-8">
      <div className="absolute -inset-4 rounded-[2rem] bg-violet/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101e31]/90 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet/20 text-violet-200"><Bot size={18} /></span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">ShopPilot · AgentShop AI</p>
                <AssistantStatusPill listening={listening} loading={loading} speaking={speaking} />
              </div>
              <p className="mt-1 text-[11px] text-mint">Online · ready to shop</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {ttsSupported && (
              <button
                type="button"
                onClick={toggleVoiceOutput}
                aria-label={voiceOutputEnabled ? 'Mute voice replies' : 'Enable voice replies'}
                className={`rounded-lg p-2 transition hover:bg-white/10 ${voiceOutputEnabled ? 'bg-mint/15 text-mint' : 'text-white/35'}`}
              >
                {voiceOutputEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            )}
            <CircleHelp size={17} className="text-white/30" />
          </div>
        </div>

        <div className="max-h-[52vh] min-h-[280px] space-y-4 overflow-y-auto p-5 pr-3 [scrollbar-color:rgba(119,224,195,0.55)_transparent] [scrollbar-width:thin]">
          <div className="flex gap-3">
            <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet/20 text-violet-200"><Sparkles size={13} /></span>
            <div className="max-w-[84%] rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/75">
              👋 Hi! I’m **ShopPilot**, your AgentShop AI shopping agent. Tell me what you need and I’ll 🔍 search the live catalog or 📦 help with your orders.
            </div>
          </div>
          {messages.map((chatMessage) => chatMessage.role === 'user' ? (
            <div key={chatMessage.id} className="ml-auto max-w-[84%] rounded-2xl rounded-tr-sm bg-violet px-4 py-3 text-sm leading-6 text-white">
              {chatMessage.content}
            </div>
          ) : (
            <div key={chatMessage.id} className="flex gap-3">
              <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet/20 text-violet-200"><Sparkles size={13} /></span>
              <div className="max-w-[84%] space-y-3">
                <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/70">
                  {chatMessage.loading ? (
                    <><span className="typing-dot" /> <span className="typing-dot delay-1" /> <span className="typing-dot delay-2" /></>
                  ) : (
                    formatAssistantMessage(chatMessage.content)
                  )}
                </div>
                {!chatMessage.loading && (
                  <ProductResults
                    products={chatMessage.products || []}
                    onAskAbout={(product) => updateMessage(`Tell me more about "${product.name}" — what's special about it?`)}
                  />
                )}
              </div>
            </div>
          ))}
          {error && <p className="ml-10 text-[10px] text-amber-200/60">{error}</p>}
        </div>

        <form onSubmit={submit} className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 p-2 focus-within:border-violet/60">
            <input value={message} onChange={(event) => updateMessage(event.target.value)} placeholder="Ask ShopPilot anything..." className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/30" />
            <button type="button" onClick={toggleVoiceLanguage} aria-label={`Switch voice language to ${voiceLanguage === 'bn-BD' ? 'English' : 'Bangla'}`} className="rounded-lg px-1.5 py-1 text-[10px] font-semibold text-white/45 transition hover:bg-white/10 hover:text-mint">{voiceLanguage === 'bn-BD' ? 'BN' : 'EN'}</button>
            <button type="button" aria-label="Use voice input" onClick={toggleVoice} className={`rounded-xl p-2.5 transition hover:bg-white/10 hover:text-mint ${listening ? 'bg-mint/20 text-mint' : 'text-white/45'}`}><Mic size={18} /></button>
            {speaking && (
              <button type="button" aria-label="Stop speaking" onClick={stopSpeaking} className="rounded-xl bg-rose-300/15 p-2.5 text-rose-200 transition hover:bg-rose-300/25">
                <Square size={16} />
              </button>
            )}
            <button type="submit" aria-label="Send message" className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-ink transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50" disabled={loading}><ChevronRight size={19} /></button>
          </div>
          <p className="mt-3 text-center text-[10px] text-white/25">ShopPilot checks live catalog and account tools. Always verify important order details.</p>
        </form>
      </div>
    </div>
  );
}
