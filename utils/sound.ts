let audioContext: AudioContext | null = null;

const getContext = () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  return audioContext;
};

export const initAudio = () => {
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(e => console.error("Audio resume failed", e));
  }
};

export const playButtonSound = () => {
  const ctx = getContext();
  if (!ctx) return;

  // Ensure context is running (important for the very first click on the menu)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // A crisp UI click sound
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
  
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + 0.1);
};

export const playPlaceSound = () => {
  const ctx = getContext();
  if (!ctx) return;
  
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // A short "pop" sound
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
  
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + 0.1);
};

export const playClearSound = (lines: number) => {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  
  // Major chord arpeggio (C Major: C, E, G, C)
  const notes = [523.25, 659.25, 783.99, 1046.50]; 
  // Play more notes for more lines (1 line = 3 notes, 2+ lines = 4 notes)
  const count = lines > 1 ? 4 : 3; 
  
  for (let i = 0; i < count; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(notes[i], t + i * 0.06);
    
    gain.gain.setValueAtTime(0.1, t + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.06 + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t + i * 0.06);
    osc.stop(t + i * 0.06 + 0.4);
  }
};

export const playGameOverSound = () => {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // Sad descending saw wave
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.linearRampToValueAtTime(50, t + 1.5);
  
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.linearRampToValueAtTime(0, t + 1.5);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + 1.5);
};