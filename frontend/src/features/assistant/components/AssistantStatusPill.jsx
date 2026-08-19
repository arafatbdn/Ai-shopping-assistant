import { Ear, Loader2, Mic, Volume2 } from 'lucide-react';

const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition';

export default function AssistantStatusPill({ listening, loading, speaking }) {
  if (speaking) {
    return (
      <span className={`${base} bg-[#FF9900]/20 text-[#FF9900]`}>
        <Volume2 size={12} />
        <span>Speaking…</span>
        <span className="ml-1 flex items-end gap-[2px]">
          <span className="wave-bar" />
          <span className="wave-bar delay-1" />
          <span className="wave-bar delay-2" />
        </span>
      </span>
    );
  }
  if (loading) {
    return (
      <span className={`${base} bg-amber-400/20 text-amber-300`}>
        <Loader2 size={12} className="animate-spin text-amber-300" />
        <span>Thinking…</span>
      </span>
    );
  }
  if (listening) {
    return (
      <span className={`${base} bg-rose-500/20 text-rose-300`}>
        <Ear size={12} />
        <span>Listening…</span>
        <span className="ml-1 flex h-2.5 items-center gap-[2px]">
          <span className="block h-1.5 w-[3px] animate-pulse rounded-full bg-rose-400" />
          <span className="block h-2 w-[3px] animate-pulse rounded-full bg-rose-400 [animation-delay:120ms]" />
          <span className="block h-1 w-[3px] animate-pulse rounded-full bg-rose-400 [animation-delay:240ms]" />
        </span>
      </span>
    );
  }
  return (
    <span className={`${base} bg-white/10 text-white/60`}>
      <Mic size={12} />
      <span>Ready</span>
    </span>
  );
}