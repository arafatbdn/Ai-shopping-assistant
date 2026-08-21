import { useEffect, useRef, useState } from 'react';
import { sendAssistantMessage } from '../api/assistantApi.js';
import useSpeechSynthesis from './useSpeechSynthesis.js';

export default function useAssistantChat(selectedPrompt = '', autoSubmit = false) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [listening, setListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState(() => window.localStorage.getItem('nova_voice_language') || 'bn-BD');
  const recognitionRef = useRef(null);
  const latestSpeechRef = useRef('');
  const lastSpokenRef = useRef('');
  const { speak, stopSpeaking, voiceOutputEnabled, enableVoiceOutput, toggleVoiceOutput, supported: ttsSupported, speaking } = useSpeechSynthesis(voiceLanguage);

  const updateMessage = (value) => {
    setMessage(value);
  };

  const toggleVoiceLanguage = () => {
    setVoiceLanguage((current) => {
      const next = current === 'bn-BD' ? 'en-US' : 'bn-BD';
      window.localStorage.setItem('nova_voice_language', next);
      return next;
    });
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (listening && recognitionRef.current) {
      latestSpeechRef.current = '';
      recognitionRef.current.stop();
      return;
    }

    stopSpeaking();
    latestSpeechRef.current = '';

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLanguage;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;
    recognition.onstart = () => {
      setListening(true);
      setError('');
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(' ');
      const text = transcript.trim();
      latestSpeechRef.current = text;
      updateMessage(text);
    };
    recognition.onerror = (event) => {
      latestSpeechRef.current = '';
      const messages = {
        'not-allowed': 'Microphone permission is blocked. Allow microphone access for localhost and try again.',
        'audio-capture': 'No microphone was found. Check your microphone connection.',
        'no-speech': 'No speech was detected. Speak closer to the microphone and try again.',
        network: 'Browser voice service is unavailable. Check your internet connection.',
      };
      setError(messages[event.error] || 'Voice input could not be captured. Please try again.');
      setListening(false);
    };
    recognition.onnomatch = () => {
      latestSpeechRef.current = '';
      setError('I could not understand that. Please speak again.');
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      const spokenText = latestSpeechRef.current;
      latestSpeechRef.current = '';
      if (spokenText) {
        enableVoiceOutput?.();
        void sendMessage(spokenText);
      }
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setListening(false);
      setError('Voice input is already starting. Please try again.');
    }
  };

  const sendMessage = async (currentMessage) => {
    if (!currentMessage?.trim() || loading) return;
    const normalizedMessage = currentMessage.trim();
    const messageId = `${Date.now()}-${Math.random()}`;
    const assistantMessageId = `${messageId}-assistant`;
    setMessages((previous) => [
      ...previous,
      { id: `${messageId}-user`, role: 'user', content: normalizedMessage },
      { id: assistantMessageId, role: 'assistant', content: '', products: [], loading: true },
    ]);
    setMessage('');
    setLoading(true);
    setError('');
    stopSpeaking();

    try {
      const { data } = await sendAssistantMessage(normalizedMessage, history);
      setMessages((previous) => previous.map((item) => item.id === assistantMessageId
        ? { ...item, content: data.message, products: data.products || [], loading: false }
        : item));
      setHistory((previous) => [...previous, { role: 'user', content: normalizedMessage }, { role: 'assistant', content: data.message }].slice(-12));
      if (data.message && data.message !== lastSpokenRef.current) {
        lastSpokenRef.current = data.message;
        speak(data.message);
      }
    } catch (requestError) {
      const serviceMessage = requestError.response?.data?.message;
      setMessages((previous) => previous.map((item) => item.id === assistantMessageId
        ? { ...item, content: serviceMessage || 'I am ready, but the shopping service is not connected yet. Start the backend and MongoDB to enable live product search.', products: [], loading: false }
        : item));
      setError(serviceMessage || 'Assistant service unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedPrompt) return;
    setMessage(selectedPrompt);
    if (autoSubmit) void sendMessage(selectedPrompt);
  }, [selectedPrompt, autoSubmit]);

  useEffect(() => () => stopSpeaking(), [stopSpeaking]);

  const submit = (event) => {
    event.preventDefault();
    void sendMessage(message);
  };

  return {
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
  };
}
