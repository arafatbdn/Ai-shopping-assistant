import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'nova_voice_output_enabled';

function isSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function pickVoice(voices, language) {
  if (!voices?.length) return null;
  const langPrefix = language?.startsWith('bn') ? 'bn' : 'en';
  const exact = voices.find((voice) => voice.lang?.toLowerCase().startsWith(langPrefix));
  if (exact) return exact;
  return voices.find((voice) => voice.default) || voices[0];
}

function sanitizeText(text) {
  return String(text || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[•·]+/g, ',')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function useSpeechSynthesis(language = 'bn-BD') {
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? false : stored === 'true';
  });
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(isSupported());
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (!supported) return undefined;
    const synth = window.speechSynthesis;

    const loadVoices = () => setVoices(synth.getVoices() || []);
    loadVoices();
    synth.addEventListener?.('voiceschanged', loadVoices);

    return () => {
      synth.removeEventListener?.('voiceschanged', loadVoices);
      synth.cancel();
    };
  }, [supported]);

  const stopSpeaking = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text) => {
      if (!supported || !voiceOutputEnabled) return;
      const cleanText = sanitizeText(text);
      if (!cleanText) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language;
      utterance.rate = 0.95;
      utterance.pitch = 1;
      const voice = pickVoice(voices, language);
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        setSpeaking(false);
        utteranceRef.current = null;
      };
      utteranceRef.current = utterance;
      try {
        synth.speak(utterance);
      } catch {
        setSpeaking(false);
      }
    },
    [supported, voiceOutputEnabled, voices, language]
  );

  const toggleVoiceOutput = useCallback(() => {
    setVoiceOutputEnabled((current) => {
      const next = !current;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      }
      if (!next) window.speechSynthesis?.cancel();
      return next;
    });
  }, []);

  return {
    supported,
    speaking,
    voiceOutputEnabled,
    toggleVoiceOutput,
    speak,
    stopSpeaking,
  };
}
