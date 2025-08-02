export const playBeep = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, ctx.currentTime); // frequency 880Hz (A4 note)
  gain.gain.setValueAtTime(0.1, ctx.currentTime); // volume

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.15); // duration 150ms
};
