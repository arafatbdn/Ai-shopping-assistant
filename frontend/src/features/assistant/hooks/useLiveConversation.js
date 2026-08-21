import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

// Ephemeral tokens (issued from POST /v1beta/auth_tokens) are only accepted
// by the v1alpha Live WebSocket endpoint, and the method must be
// `BidiGenerateContentConstrained` (not `BidiGenerateContent`). Using the
// v1beta / `BidiGenerateContent` path leaves the socket open but Gemini
// never acknowledges setup — the UI gets stuck on "Connecting".
const LIVE_WS_URL =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

/**
 * useLiveConversation
 * Owns a Gemini Live API bidirectional WebSocket session.
 *
 * Flow:
 *  1. POST /api/live/token (server returns ephemeral token + locked setup payload).
 *  2. Open WebSocket with ?access_token=<token>.
 *  3. Send { setup: {...} } to lock the model, voice, system instruction, tools, transcription.
 *  4. Capture mic via AudioContext (16kHz mono PCM 16-bit) and stream as realtimeInput.audio.
 *  5. Queue output audio (24kHz mono PCM 16-bit) and schedule playback.
 *  6. On toolCall.functionCalls, POST /api/agent/execute and send toolResponse.
 *  7. Surface input/output transcriptions, status, errors, and a stop() teardown.
 */
export default function useLiveConversation() {
  const [status, setStatus] = useState('idle'); // idle | connecting | ready | listening | speaking | thinking | error
  const [error, setError] = useState(null);
  const [inputTranscript, setInputTranscript] = useState(''); // user speech (live)
  const [outputTranscript, setOutputTranscript] = useState(''); // model speech (live)
  const [supported, setSupported] = useState(true);

  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const inputNodeRef = useRef(null);
  const inputStreamRef = useRef(null);
  const nextScheduledTimeRef = useRef(0);
  const activeSourcesRef = useRef([]);
  const closedByUserRef = useRef(false);
  const setupCompleteRef = useRef(false);
  const startMicCaptureRef = useRef(null);

  const log = useCallback((...args) => {
    // eslint-disable-next-line no-console
    console.info('[live]', ...args);
  }, []);

  const stopAllAudio = useCallback(() => {
    activeSourcesRef.current.forEach((s) => {
      try { s.stop(); } catch {}
    });
    activeSourcesRef.current = [];
    nextScheduledTimeRef.current = 0;
    if (inputNodeRef.current) {
      try { inputNodeRef.current.disconnect(); } catch {}
      inputNodeRef.current.ondataavailable = null;
      inputNodeRef.current = null;
    }
    if (inputStreamRef.current) {
      inputStreamRef.current.getTracks().forEach((t) => t.stop());
      inputStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;
  }, []);

  const sendMessage = useCallback((message) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(message));
  }, []);

  const queueAudio = useCallback((base64Pcm) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const bytes = base64ToBytes(base64Pcm);
    const samples = int16leToFloat32(bytes);
    const buffer = ctx.createBuffer(1, samples.length, OUTPUT_SAMPLE_RATE);
    buffer.getChannelData(0).set(samples);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startTime = Math.max(now, nextScheduledTimeRef.current);
    source.start(startTime);
    nextScheduledTimeRef.current = startTime + buffer.duration;
    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
    };
  }, []);

  const handleToolCalls = useCallback(async (functionCalls) => {
    if (!Array.isArray(functionCalls) || functionCalls.length === 0) return;
    setStatus('thinking');
    setOutputTranscript(''); // Clear pre-tool internal reasoning
    try {
      const calls = functionCalls.map((call) => ({ id: call.id, name: call.name, args: call.args || {} }));
      const authToken = localStorage.getItem('nova_access_token');
      const { data } = await axios.post('/api/agent/execute', { calls }, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const functionResponses = (data?.responses || []).map((resp) => ({
        id: resp.id,
        name: resp.name,
        response: resp.response,
      }));
      sendMessage({ toolResponse: { functionResponses } });
    } catch (err) {
      log('tool execution failed', err.message);
      setError(err.response?.data?.message || err.message || 'Tool execution failed');
    } finally {
      setStatus('ready');
    }
  }, [sendMessage, log]);

  const handleServerMessage = useCallback(async (event) => {
    let rawText;
    if (typeof event.data === 'string') {
      rawText = event.data;
    } else if (event.data instanceof Blob) {
      rawText = await event.data.text();
    } else if (event.data instanceof ArrayBuffer) {
      rawText = new TextDecoder().decode(event.data);
    } else {
      rawText = String(event.data);
    }

    let payload;
    try {
      payload = JSON.parse(rawText);
    } catch (err) {
      log('non-JSON frame', rawText);
      return;
    }

    if (payload.setupComplete) {
      setupCompleteRef.current = true;
      setStatus('ready');
      log('setup complete');
      const micPromise = startMicCaptureRef.current?.();
      if (micPromise && micPromise.catch) {
        micPromise.catch((err) => {
          log('mic start failed after setup', err.message);
          setError(err.message || 'Microphone access failed');
          setStatus('error');
        });
      } else if (!micPromise) {
        log('startMicCaptureRef is null');
      }
      return;
    }

    const serverContent = payload.serverContent;
    if (serverContent) {
      if (serverContent.interrupted) {
        // Model was interrupted; stop active audio immediately so we don't talk over the user.
        activeSourcesRef.current.forEach((s) => {
          try { s.stop(); } catch {}
        });
        activeSourcesRef.current = [];
        nextScheduledTimeRef.current = 0;
        setStatus('ready');
        return;
      }
      if (serverContent.modelTurn?.parts) {
        let hasAudio = false;
        for (const part of serverContent.modelTurn.parts) {
          if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/')) {
            queueAudio(part.inlineData.data);
            hasAudio = true;
          } else if (part.text) {
            const isMonologue = part.text.includes("I've determined") || part.text.includes("Initiating") || part.text.includes("formulating");
            if (!isMonologue) {
              const cleaned = part.text.replace(/\*\*[^*]+\*\*\n*/g, '').trim();
              if (cleaned) {
                setOutputTranscript((prev) => (prev ? `${prev} ${cleaned}` : cleaned));
              }
            }
          }
        }
        if (hasAudio) setStatus('speaking');
      }
      if (serverContent.inputTranscription?.text) {
        setInputTranscript((prev) => prev + serverContent.inputTranscription.text);
      }
      if (serverContent.outputTranscription?.text) {
        setOutputTranscript((prev) => {
          if (prev.includes("I've determined") || prev.includes("Initiating") || prev.includes("formulating")) {
            return serverContent.outputTranscription.text;
          }
          return prev + serverContent.outputTranscription.text;
        });
      }
      if (serverContent.turnComplete) {
        setStatus('ready');
      }
      return;
    }

    if (payload.toolCall?.functionCalls) {
      handleToolCalls(payload.toolCall.functionCalls);
      return;
    }

    if (payload.toolCallCancellation) {
      log('tool call cancelled', payload.toolCallCancellation);
      return;
    }

    if (payload.goAway) {
      log('goAway received; closing session');
      stop();
      return;
    }
  }, [handleToolCalls, log, queueAudio]);

  const startMicCapture = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone API not available');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: INPUT_SAMPLE_RATE,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    inputStreamRef.current = stream;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = audioContextRef.current || new AudioCtx({ sampleRate: INPUT_SAMPLE_RATE });
    audioContextRef.current = ctx;
    if (ctx.state === 'suspended') await ctx.resume();

    const source = ctx.createMediaStreamSource(stream);
    // Use AudioWorkletNode if available; fall back to ScriptProcessor for older browsers.
    let workletReady = false;
    try {
      await ctx.audioWorklet.addModule(liveWorkletUrl());
      workletReady = true;
    } catch (err) {
      log('AudioWorklet unavailable, using ScriptProcessor fallback', err?.message);
    }

    if (workletReady) {
      const node = new AudioWorkletNode(ctx, 'live-mic-capture');
      node.port.onmessage = (event) => {
        if (event.data?.type === 'pcm' && setupCompleteRef.current && event.data.buffer) {
          const { buffer, rms } = event.data;

          // Instant Client-Side Barge-In:
          // If user speaks (energy > threshold) while model audio is playing, cut audio immediately!
          if (rms > 0.045 && activeSourcesRef.current.length > 0) {
            log('User speech detected during model playback — instant client-side barge-in');
            activeSourcesRef.current.forEach((s) => {
              try { s.stop(); } catch {}
            });
            activeSourcesRef.current = [];
            nextScheduledTimeRef.current = 0;
            setStatus('listening');
            sendMessage({ realtimeInput: { activityStart: {} } });
          }

          const bytes = new Uint8Array(buffer);
          const base64 = bytesToBase64(bytes);
          sendMessage({
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: 'audio/pcm;rate=16000',
                  data: base64,
                },
              ],
            },
          });
        }
      };
      source.connect(node);
      // We don't connect to destination — we only want the audio data, not playback.
      inputNodeRef.current = node;
    } else {
      const bufferSize = 1024;
      const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
      processor.onaudioprocess = (e) => {
        if (!setupCompleteRef.current) return;
        const input = e.inputBuffer.getChannelData(0);
        let sumSq = 0;
        for (let i = 0; i < input.length; i += 1) sumSq += input[i] * input[i];
        const rms = Math.sqrt(sumSq / input.length);

        if (rms > 0.045 && activeSourcesRef.current.length > 0) {
          activeSourcesRef.current.forEach((s) => {
            try { s.stop(); } catch {}
          });
          activeSourcesRef.current = [];
          nextScheduledTimeRef.current = 0;
          setStatus('listening');
          sendMessage({ realtimeInput: { activityStart: {} } });
        }

        const pcm = float32ToInt16le(input);
        sendMessage({
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: 'audio/pcm;rate=16000',
                data: bytesToBase64(pcm),
              },
            ],
          },
        });
      };
      source.connect(processor);
      processor.connect(ctx.destination);
      inputNodeRef.current = processor;
    }

    // Mic capture starts here; status is managed by the server-message loop
    // (setupComplete -> 'ready', modelTurn with audio -> 'speaking', etc.).
  }, [log, sendMessage]);

  const start = useCallback(async () => {
    setError(null);
    setInputTranscript('');
    setOutputTranscript('');
    setupCompleteRef.current = false;
    closedByUserRef.current = false;

    if (typeof window === 'undefined' || !('WebSocket' in window)) {
      setSupported(false);
      setError('WebSocket is not supported in this browser');
      setStatus('error');
      return;
    }

    setStatus('connecting');
    try {
      const authToken = localStorage.getItem('nova_access_token');
      const { data } = await axios.post('/api/live/token', {}, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      const ws = new WebSocket(`${LIVE_WS_URL}?access_token=${encodeURIComponent(data.token)}`);
      socketRef.current = ws;

      ws.onopen = () => {
        const setupMessage = {
          setup: {
            model: `models/${data.model}`,
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: data.voice } },
              },
              temperature: 0.3,
            },
            // Live API expects a Content object, not a bare string.
            systemInstruction: {
              role: 'system',
              parts: [{ text: data.systemInstruction }],
            },
            tools: [{ functionDeclarations: data.tools }],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        };
        ws.send(JSON.stringify(setupMessage));
        log('socket open, setup sent');
      };

      ws.onmessage = handleServerMessage;

      ws.onerror = (event) => {
        log('socket error', event);
        setError('Voice connection error');
        setStatus('error');
      };

      ws.onclose = () => {
        log('socket closed');
        stopAllAudio();
        socketRef.current = null;
        if (!closedByUserRef.current) {
          setStatus('idle');
        }
      };
      // NOTE: microphone capture is now triggered from `handleServerMessage`
      // once we receive the `setupComplete` frame, so we never send audio
      // frames before Gemini has acknowledged setup.
    } catch (err) {
      log('start failed', err.message);
      const detail = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to start voice session';
      setError(detail);
      setStatus('error');
      stopAllAudio();
      socketRef.current?.close();
      socketRef.current = null;
    }
  }, [handleServerMessage, log, status, stopAllAudio]);

  const stop = useCallback(() => {
    closedByUserRef.current = true;
    setStatus('idle');
    setInputTranscript('');
    setOutputTranscript('');
    stopAllAudio();
    const ws = socketRef.current;
    if (ws && ws.readyState <= WebSocket.OPEN) {
      try { ws.close(); } catch {}
    }
    socketRef.current = null;
  }, [stopAllAudio]);

  const interrupt = useCallback(() => {
    // Send an activity-start signal so the model knows the user took the floor.
    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ realtimeInput: { activityStart: {} } }));
    }
    activeSourcesRef.current.forEach((s) => {
      try { s.stop(); } catch {}
    });
    activeSourcesRef.current = [];
    nextScheduledTimeRef.current = 0;
  }, []);

  useEffect(() => {
    startMicCaptureRef.current = startMicCapture;
  }, [startMicCapture]);

  useEffect(() => () => stop(), [stop]);

  return {
    status,
    error,
    supported,
    inputTranscript,
    outputTranscript,
    start,
    stop,
    interrupt,
    isLive: status !== 'idle' && status !== 'error',
  };
}

// ----- audio helpers -----

function base64ToBytes(b64) {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x4000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function int16leToFloat32(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const samples = new Float32Array(bytes.length / 2);
  for (let i = 0; i < samples.length; i += 1) {
    const s = view.getInt16(i * 2, true);
    samples[i] = s < 0 ? s / 0x8000 : s / 0x7fff;
  }
  return samples;
}

function float32ToInt16le(samples) {
  const out = new Uint8Array(samples.length * 2);
  const view = new DataView(out.buffer);
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return out;
}

function liveWorkletUrl() {
  // Inline AudioWorklet via Blob URL so we don't ship a separate asset.
  const source = `
    class LiveMicCapture extends AudioWorkletProcessor {
      constructor() {
        super();
        this.buffer = new Int16Array(512);
        this.bufferIndex = 0;
        this.sumSq = 0;
      }

      process(inputs) {
        const channel = inputs[0]?.[0];
        if (!channel || channel.length === 0) return true;

        for (let i = 0; i < channel.length; i += 1) {
          const v = Math.max(-1, Math.min(1, channel[i]));
          this.sumSq += v * v;
          this.buffer[this.bufferIndex++] = v < 0 ? v * 0x8000 : v * 0x7fff;

          if (this.bufferIndex >= this.buffer.length) {
            const rms = Math.sqrt(this.sumSq / this.buffer.length);
            const out = this.buffer.slice();
            this.port.postMessage({ type: 'pcm', buffer: out.buffer, rms }, [out.buffer]);
            this.bufferIndex = 0;
            this.sumSq = 0;
          }
        }
        return true;
      }
    }
    registerProcessor('live-mic-capture', LiveMicCapture);
  `;
  return URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
}