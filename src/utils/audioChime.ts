// Professional Web Audio Synthesizer for Trading Alerts

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSignalSound(action: 'BUY' | 'SELL' | 'TEST') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (action === 'BUY') {
      // Ascending two-tone crisp harmonic chime (880Hz -> 1320Hz)
      playTone(ctx, 880, now, 0.18, 'triangle', 0.15);
      playTone(ctx, 1318.5, now + 0.12, 0.35, 'sine', 0.2);
    } else if (action === 'SELL') {
      // Descending warning alert chime (1174Hz -> 784Hz)
      playTone(ctx, 1174.66, now, 0.18, 'triangle', 0.15);
      playTone(ctx, 783.99, now + 0.12, 0.35, 'sine', 0.2);
    } else {
      // Short neutral notification bell
      playTone(ctx, 987.77, now, 0.2, 'sine', 0.15);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainLevel: number = 0.15
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}
