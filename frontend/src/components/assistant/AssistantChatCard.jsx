import {
  Bot,
  ChevronRight,
  CircleHelp,
  Headphones,
  Loader2,
  Mic,
  Phone,
  PhoneOff,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import useAssistantChat from '../../features/assistant/hooks/useAssistantChat.js';
import useLiveConversation from '../../features/assistant/hooks/useLiveConversation.js';
import AssistantStatusPill from '../../features/assistant/components/AssistantStatusPill.jsx';
import ProductResults from './ProductResults.jsx';
import { formatAssistantMessage } from '../../shared/utils/formatMessage.jsx';

export default function AssistantChatCard({ selectedPrompt, autoSubmit }) {
  const textChat = useAssistantChat(selectedPrompt, autoSubmit);
  const live = useLiveConversation();
  const [audioMode, setAudioMode] = useState(false);

  // When switching modes, tear down the other mode to free mic + socket.
  useEffect(() => {
    if (audioMode) textChat.stopSpeaking?.();
    else live.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioMode]);

  if (audioMode) {
    return (
      <LivePanel
        live={live}
        onExit={() => {
          live.stop();
          setAudioMode(false);
        }}
      />
    );
  }

  return (
    <TextPanel
      textChat={textChat}
      onEnterAudio={() => setAudioMode(true)}
      audioSupported={live.supported}
    />
  );
}

function TextPanel({ textChat, onEnterAudio, audioSupported }) {
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
  } = textChat;

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
            {audioSupported && (
              <button
                type="button"
                onClick={onEnterAudio}
                aria-label="Switch to live voice conversation"
                title="Live voice mode (Gemini)"
                className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-mint"
              >
                <Headphones size={16} />
              </button>
            )}
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

function LivePanel({ live, onExit }) {
  const { status, error, start, stop, inputTranscript, outputTranscript, isLive } = live;
  const busy = status === 'connecting' || status === 'thinking';

  return (
    <div id="shoppilot-agent-live" className="relative mx-auto w-full max-w-xl scroll-mt-8">
      <div className="absolute -inset-4 rounded-[2rem] bg-mint/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101e31]/90 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint/20 text-mint"><Headphones size={18} /></span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Live voice · ShopPilot (v5)</p>
                <LiveStatusBadge status={status} />
              </div>
              <p className="mt-1 text-[11px] text-mint">Native Gemini audio · hands-free</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onExit}
            aria-label="Exit voice conversation"
            className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            <CircleHelp size={17} className="text-white/30" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid place-items-center py-6">
            <button
              type="button"
              onClick={() => (isLive ? stop() : start())}
              disabled={busy}
              aria-label={isLive ? 'End voice conversation' : 'Start voice conversation'}
              className={`group relative grid h-28 w-28 place-items-center rounded-full transition disabled:cursor-not-allowed ${
                isLive
                  ? 'bg-rose-300/20 text-rose-200 hover:bg-rose-300/30'
                  : 'bg-mint/20 text-mint hover:bg-mint/30'
              }`}
            >
              {status === 'connecting' || status === 'thinking' ? (
                <Loader2 size={36} className="animate-spin" />
              ) : isLive ? (
                <PhoneOff size={32} />
              ) : (
                <Phone size={32} />
              )}
              <span
                className={`absolute inset-0 rounded-full border border-mint/40 ${
                  isLive ? 'animate-ping' : ''
                }`}
              />
            </button>
            <p className="mt-4 text-xs text-white/55">
              {isLive
                ? status === 'speaking'
                  ? 'ShopPilot is speaking…'
                  : status === 'listening' || status === 'ready'
                    ? 'Listening to you…'
                    : status === 'thinking'
                      ? 'Running a tool…'
                      : 'Tap to end'
                : 'Tap to start talking'}
            </p>
          </div>

          {(inputTranscript || outputTranscript) && (
            <div className="space-y-2 rounded-2xl bg-white/[0.04] p-4 text-sm leading-6 text-white/70">
              {inputTranscript && (
                <p>
                  <span className="mr-2 text-[10px] uppercase tracking-wider text-rose-200/70">You</span>
                  {inputTranscript}
                </p>
              )}
              {outputTranscript && (
                <p>
                  <span className="mr-2 text-[10px] uppercase tracking-wider text-mint">ShopPilot</span>
                  {outputTranscript}
                </p>
              )}
            </div>
          )}

          {error && <p className="text-[10px] text-amber-200/60">{error}</p>}
        </div>

        <div className="border-t border-white/10 p-4">
          <p className="text-center text-[10px] text-white/25">
            Conversations stream over a single-use Gemini token. Sign in for cart, wishlist, and order tools.
          </p>
        </div>
      </div>
    </div>
  );
}

function LiveStatusBadge({ status }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition';
  if (status === 'speaking') {
    return (
      <span className={`${base} bg-mint/15 text-mint`}>
        <Volume2 size={12} />
        <span>Speaking</span>
      </span>
    );
  }
  if (status === 'listening' || status === 'ready') {
    return (
      <span className={`${base} bg-mint/15 text-mint`}>
        <Mic size={12} />
        <span>Listening</span>
      </span>
    );
  }
  if (status === 'thinking' || status === 'connecting') {
    return (
      <span className={`${base} bg-violet/15 text-violet-200`}>
        <Loader2 size={12} className="animate-spin" />
        <span>{status === 'connecting' ? 'Connecting' : 'Thinking'}</span>
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className={`${base} bg-rose-300/20 text-rose-200`}>
        <span>Error</span>
      </span>
    );
  }
  return (
    <span className={`${base} bg-white/[0.05] text-white/35`}>
      <Headphones size={12} />
      <span>Idle</span>
    </span>
  );
}
