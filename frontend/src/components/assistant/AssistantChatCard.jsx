import {
  Bot,
  ChevronRight,
  CircleHelp,
  Headset,
  Loader2,
  Mic,
  Minus,
  Phone,
  PhoneOff,
  Radio,
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

export default function AssistantChatCard({ selectedPrompt, autoSubmit, onMinimize }) {
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
        onMinimize={onMinimize}
      />
    );
  }

  return (
    <TextPanel
      textChat={textChat}
      onEnterAudio={() => setAudioMode(true)}
      audioSupported={live.supported}
      onMinimize={onMinimize}
    />
  );
}

function TextPanel({ textChat, onEnterAudio, audioSupported, onMinimize }) {
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
      <div className="relative overflow-hidden rounded-2xl border border-[#232f3e] bg-[#131921] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#232f3e] bg-[#131921] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FF9900]/20 text-[#FF9900]">
              <Bot size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">ShopPilot · AgentShop AI</p>
                <AssistantStatusPill listening={listening} loading={loading} speaking={speaking} />
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-[#f3a847]">Online · ready to shop</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {audioSupported && (
              <button
                type="button"
                onClick={onEnterAudio}
                aria-label="Switch to live voice conversation"
                title="Live voice mode (Gemini)"
                className="flex items-center gap-1.5 rounded-full border border-[#FF9900]/50 bg-[#FF9900]/15 px-3 py-1.5 text-xs font-bold text-[#FF9900] shadow-sm transition hover:border-[#FF9900] hover:bg-[#FF9900]/25 active:scale-95"
              >
                <Radio size={14} className="animate-pulse text-[#FF9900]" />
                <span>Live Voice</span>
              </button>
            )}
            {ttsSupported && (
              <button
                type="button"
                onClick={toggleVoiceOutput}
                aria-label={voiceOutputEnabled ? 'Mute voice replies' : 'Enable voice replies'}
                className={`rounded-lg p-2 transition hover:bg-white/10 ${voiceOutputEnabled ? 'bg-[#FF9900]/20 text-[#FF9900]' : 'text-white/50'}`}
              >
                {voiceOutputEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>
            )}
            <CircleHelp size={17} className="text-white/35" />
            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                aria-label="Minimize ShopPilot chat"
                title="Minimize chat"
                className="ml-0.5 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-[#FF9900]"
              >
                <Minus size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[52vh] min-h-[280px] space-y-4 overflow-y-auto bg-[#131921] p-5 pr-3 [scrollbar-color:rgba(255,153,0,0.5)_transparent] [scrollbar-width:thin]">
          <div className="flex gap-3">
            <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#FF9900]/20 text-[#FF9900]">
              <Sparkles size={13} />
            </span>
            <div className="max-w-[84%] rounded-2xl rounded-tl-sm border border-white/10 bg-[#232f3e] px-4 py-3 text-sm leading-6 text-white/90">
              👋 Hi! I’m <strong className="text-[#FF9900]">ShopPilot</strong>, your AgentShop AI shopping agent. Tell me what you need and I’ll 🔍 search the live catalog or 📦 help with your orders.
            </div>
          </div>
          {messages.map((chatMessage) =>
            chatMessage.role === 'user' ? (
              <div
                key={chatMessage.id}
                className="ml-auto max-w-[84%] rounded-2xl rounded-tr-sm bg-[#FF9900] px-4 py-3 text-sm font-medium leading-6 text-[#0f1111] shadow-sm"
              >
                {chatMessage.content}
              </div>
            ) : (
              <div key={chatMessage.id} className="flex gap-3">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#FF9900]/20 text-[#FF9900]">
                  <Sparkles size={13} />
                </span>
                <div className="max-w-[84%] space-y-3">
                  <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-[#232f3e] px-4 py-3 text-sm leading-6 text-white/90">
                    {chatMessage.loading ? (
                      <>
                        <span className="typing-dot" /> <span className="typing-dot delay-1" /> <span className="typing-dot delay-2" />
                      </>
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
            )
          )}
          {error && <p className="ml-10 text-[10px] text-amber-200/80">{error}</p>}
        </div>

        <form onSubmit={submit} className="border-t border-[#232f3e] bg-[#131921] p-4">
          <div className="flex items-center gap-2 rounded-xl border border-[#232f3e] bg-[#0f1111]/70 p-2 focus-within:border-[#FF9900]">
            <input
              value={message}
              onChange={(event) => updateMessage(event.target.value)}
              placeholder="Ask ShopPilot anything..."
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button
              type="button"
              onClick={toggleVoiceLanguage}
              aria-label={`Switch voice language to ${voiceLanguage === 'bn-BD' ? 'English' : 'Bangla'}`}
              className="rounded-lg px-2 py-1 text-[10px] font-bold text-white/60 transition hover:bg-white/10 hover:text-[#FF9900]"
            >
              {voiceLanguage === 'bn-BD' ? 'BN' : 'EN'}
            </button>
            <button
              type="button"
              aria-label="Use voice input"
              onClick={toggleVoice}
              className={`rounded-xl p-2.5 transition hover:bg-white/10 ${listening ? 'bg-[#FF9900]/25 text-[#FF9900]' : 'text-white/50 hover:text-[#FF9900]'}`}
            >
              <Mic size={18} />
            </button>
            {speaking && (
              <button
                type="button"
                aria-label="Stop speaking"
                onClick={stopSpeaking}
                className="rounded-xl bg-rose-500/20 p-2.5 text-rose-300 transition hover:bg-rose-500/30"
              >
                <Square size={16} />
              </button>
            )}
            <button
              type="submit"
              aria-label="Send message"
              className="grid h-10 w-10 place-items-center rounded-xl bg-[#FF9900] text-[#131921] font-bold transition hover:bg-[#ffd814] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] text-white/35">ShopPilot checks live catalog and account tools. Always verify important order details.</p>
        </form>
      </div>
    </div>
  );
}

function LivePanel({ live, onExit, onMinimize }) {
  const { status, error, start, stop, inputTranscript, outputTranscript, isLive } = live;
  const busy = status === 'connecting' || status === 'thinking';

  return (
    <div id="shoppilot-agent-live" className="relative mx-auto w-full max-w-xl scroll-mt-8">
      <div className="relative overflow-hidden rounded-2xl border border-[#232f3e] bg-[#131921] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#232f3e] bg-[#131921] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FF9900]/20 text-[#FF9900]">
              <Radio size={18} className="animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">Live voice · ShopPilot</p>
                <LiveStatusBadge status={status} />
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-[#f3a847]">Native Gemini audio · hands-free</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onExit}
              aria-label="Exit voice conversation"
              className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <CircleHelp size={17} className="text-white/35" />
            </button>
            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                aria-label="Minimize ShopPilot chat"
                title="Minimize chat"
                className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-[#FF9900]"
              >
                <Minus size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4 bg-[#131921] p-5">
          <div className="grid place-items-center py-6">
            <button
              type="button"
              onClick={() => (isLive ? stop() : start())}
              disabled={busy}
              aria-label={isLive ? 'End voice conversation' : 'Start voice conversation'}
              className={`group relative grid h-28 w-28 place-items-center rounded-full transition disabled:cursor-not-allowed ${
                isLive
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-[#FF9900]/20 text-[#FF9900] hover:bg-[#FF9900]/30'
              }`}
            >
              {status === 'connecting' || status === 'thinking' ? (
                <Loader2 size={36} className="animate-spin text-[#FF9900]" />
              ) : isLive ? (
                <PhoneOff size={32} />
              ) : (
                <Phone size={32} />
              )}
              <span
                className={`absolute inset-0 rounded-full border border-[#FF9900]/40 ${
                  isLive ? 'animate-ping' : ''
                }`}
              />
            </button>
            <p className="mt-4 text-xs font-medium text-white/70">
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
            <div className="space-y-2 rounded-2xl border border-white/10 bg-[#232f3e] p-4 text-sm leading-6 text-white/85">
              {inputTranscript && (
                <p>
                  <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-[#FF9900]">You</span>
                  {inputTranscript}
                </p>
              )}
              {outputTranscript && (
                <p>
                  <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-[#f3a847]">ShopPilot</span>
                  {outputTranscript}
                </p>
              )}
            </div>
          )}

          {error && <p className="text-[10px] text-amber-200/80">{error}</p>}
        </div>

        <div className="border-t border-[#232f3e] bg-[#131921] p-4">
          <p className="text-center text-[10px] text-white/35">
            Conversations stream over a single-use Gemini token. Sign in for cart, wishlist, and order tools.
          </p>
        </div>
      </div>
    </div>
  );
}

function LiveStatusBadge({ status }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition';
  if (status === 'speaking') {
    return (
      <span className={`${base} bg-[#FF9900]/20 text-[#FF9900]`}>
        <Volume2 size={12} />
        <span>Speaking</span>
      </span>
    );
  }
  if (status === 'listening' || status === 'ready') {
    return (
      <span className={`${base} bg-[#FF9900]/20 text-[#FF9900]`}>
        <Mic size={12} />
        <span>Listening</span>
      </span>
    );
  }
  if (status === 'thinking' || status === 'connecting') {
    return (
      <span className={`${base} bg-amber-400/20 text-amber-300`}>
        <Loader2 size={12} className="animate-spin" />
        <span>{status === 'connecting' ? 'Connecting' : 'Thinking'}</span>
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className={`${base} bg-rose-500/20 text-rose-300`}>
        <span>Error</span>
      </span>
    );
  }
  return (
    <span className={`${base} bg-white/10 text-white/60`}>
      <Radio size={12} />
      <span>Idle</span>
    </span>
  );
}
