const positiveWords = ['good', 'great', 'love', 'excellent', 'ভালো', 'দারুণ', 'সুন্দর', 'খুশি'];
const negativeWords = ['bad', 'poor', 'hate', 'broken', 'অসুবিধা', 'খারাপ', 'ভেঙে', 'রাগ'];

export async function detectSentiment(args = {}) {
  const text = String(args.text || '').toLowerCase();
  if (!text) return { ok: false, message: 'Provide text to analyze.' };
  const positive = positiveWords.filter((word) => text.includes(word)).length;
  const negative = negativeWords.filter((word) => text.includes(word)).length;
  const label = positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral';
  return { ok: true, sentiment: label, confidence: positive === negative ? 0.5 : 0.8, signals: { positive, negative } };
}
