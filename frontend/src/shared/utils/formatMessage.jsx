// Lightweight markdown-ish formatter for assistant replies.
// Supports:
//  - **bold**  -> <strong>
//  - *italic*  -> <em>
//  - `inline`  -> <code>
//  - Lines starting with "- " or "• " become a <ul>
//  - Auto-decorates with emojis for common shopping keywords if the
//    response is missing them entirely (keeps the chat friendly).
//  - Preserves newlines as <br /> inside paragraphs.

import { Fragment } from 'react';

const KEYWORD_EMOJI = [
  { match: /(সার্চ|খুঁজ|search|find)/i, emoji: '🔍' },
  { match: /(ট্র্যাক|track|status|অবস্থা)/i, emoji: '📦' },
  { match: /(প্রাইস|price|টাকা|৳|budget|বাজেট)/i, emoji: '💰' },
  { match: /(ল্যাপটপ|laptop|কম্পিউটার|computer|pc)/i, emoji: '💻' },
  { match: /(মোবাইল|phone|smartphone|smart ফোন)/i, emoji: '📱' },
  { match: /(হেডফোন|headphone|earbud)/i, emoji: '🎧' },
  { match: /(ক্যামেরা|camera)/i, emoji: '📷' },
  { match: /(ঘড়ি|watch)/i, emoji: '⌚' },
  { match: /(গেমিং|gaming|game|গেম)/i, emoji: '🎮' },
  { match: /(অর্ডার|order)/i, emoji: '🛒' },
  { match: /(সারাংশ|summary|রিভিউ|review)/i, emoji: '💡' },
  { match: /(তুলনা|compare|comparison)/i, emoji: '⚖️' },
  { match: /(কুপন|coupon|ছাড়|discount|সেভ|save)/i, emoji: '🎟️' },
  { match: /(স্বাগতম|welcome|hi|hello|হ্যালো|নমস্কার)/i, emoji: '👋' },
  { match: /(ধন্যবাদ|thanks|thank you|শুকরিয়া)/i, emoji: '🙏' },
  { match: /(সমস্যা|problem|error|ভুল|সরি|sorry)/i, emoji: '⚠️' },
  { match: /(সফল|success|কনফার্ম|confirm|done|হয়ে গেছে)/i, emoji: '🎉' },
  { match: /(কার্ট|cart)/i, emoji: '🛍️' },
  { match: /(প্রিয়|love|ভালো|best|সেরা)/i, emoji: '❤️' },
];

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function ensureLeadingEmoji(text) {
  if (!text) return text;
  if (EMOJI_REGEX.test(text)) return text;
  for (const rule of KEYWORD_EMOJI) {
    if (rule.match.test(text)) {
      return `${rule.emoji} ${text}`;
    }
  }
  return text;
}

function renderInline(text, keyPrefix) {
  const nodes = [];
  // Tokenize **bold**, *italic*, `code` in order.
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[2] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-white">
          {match[2]}
        </strong>,
      );
    } else if (match[3] !== undefined) {
      nodes.push(
        <em key={`${keyPrefix}-i-${i}`} className="italic text-white/85">
          {match[3]}
        </em>,
      );
    } else if (match[4] !== undefined) {
      nodes.push(
        <code
          key={`${keyPrefix}-c-${i}`}
          className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.85em] text-mint"
        >
          {match[4]}
        </code>,
      );
    }
    lastIndex = regex.lastIndex;
    i += 1;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function isListItem(line) {
  return /^\s*([-*•])\s+/.test(line);
}

function renderBlock(block, blockIndex) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  if (isListItem(trimmed)) {
    const items = block
      .split(/\n/)
      .map((line) => line.trim())
      .filter(isListItem)
      .map((line) => line.replace(/^\s*[-*•]\s+/, ''));
    return (
      <ul
        key={`ul-${blockIndex}`}
        className="ml-5 list-disc space-y-1.5 text-white/75 marker:text-mint/60"
      >
        {items.map((item, idx) => (
          <li key={`li-${blockIndex}-${idx}`}>{renderInline(item, `ul-${blockIndex}-${idx}`)}</li>
        ))}
      </ul>
    );
  }

  return (
    <p key={`p-${blockIndex}`} className="text-white/75">
      {renderInline(ensureLeadingEmoji(trimmed), `p-${blockIndex}`)}
    </p>
  );
}

export function formatAssistantMessage(content) {
  if (!content) return null;
  const blocks = content.split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, idx) => (
        <Fragment key={`block-${idx}`}>{renderBlock(block, idx)}</Fragment>
      ))}
    </div>
  );
}
