import { Ear, Loader2, Mic, Volume2 } from 'lucide-react';

const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition';

export default function AssistantStatusPill({ listening, loading, speaking }) {
  if (speaking) {
    return (
      <span className={`${base} bg-mint/15 text-mint`}>
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
      <span className={`${base} bg-violet/15 text-violet-200`}>
        <Loader2 size={12} className="animate-spin" />
        <span>Thinking…</span>
      </span>
    );
  }
  if (listening) {
    return (
      <span className={`${base} bg-rose-300/15 text-rose-200`}>
        <Ear size={12} />
        <span>Listening…</span>
        <span className="ml-1 flex h-2.5 items-center gap-[2px]">
          <span className="block h-1.5 w-[3px] animate-pulse rounded-full bg-rose-300" />
          <span className="block h-2 w-[3px] animate-pulse rounded-full bg-rose-300 [animation-delay:120ms]" />
          <span className="block h-1 w-[3px] animate-pulse rounded-full bg-rose-300 [animation-delay:240ms]" />
        </span>
      </span>
    );
  }
  return (
    <span className={`${base} bg-white/[0.05] text-white/35`}>
      <Mic size={12} />
      <span>Ready</span>
    </span>
  );
}