// Genera gli effetti sonori (sintetizzati, quindi liberi da diritti) in public/sfx/
// Uso: npm run sfx
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sfx');
mkdirSync(outDir, {recursive: true});

// generatore pseudo-casuale deterministico
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

const buf = (seconds) => new Float32Array(Math.round(seconds * SR));

const biquad = (x, type, freq, q = 0.707) => {
  const w = (2 * Math.PI * freq) / SR;
  const a = Math.sin(w) / (2 * q);
  const c = Math.cos(w);
  let b0, b1, b2;
  if (type === 'lp') [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
  else if (type === 'hp') [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  else [b0, b1, b2] = [a, 0, -a]; // band-pass
  const a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
};

const noise = (seconds) => buf(seconds).map(() => rnd());
const mix = (target, src, at = 0, gain = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < target.length; i++) target[o + i] += src[i] * gain;
  return target;
};
const env = (x, fn) => x.map((v, i) => v * fn(i / SR, x.length / SR));
const tone = (seconds, freq, decay, phase = 0) =>
  buf(seconds).map((_, i) => Math.sin(2 * Math.PI * freq * (i / SR) + phase) * Math.exp(-(i / SR) / decay));

const normalize = (x, peak = 0.9) => {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  return m ? x.map((v) => (v / m) * peak) : x;
};

const writeWav = (name, x) => {
  const data = Buffer.alloc(x.length * 2);
  x.forEach((v, i) => data.writeInt16LE(Math.max(-1, Math.min(1, v)) * 32767, i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  writeFileSync(join(outDir, name), Buffer.concat([h, data]));
  console.log('✓', name);
};

// Faretto che si accende: clic dell'interruttore + tonfo morbido
{
  const out = buf(1.2);
  mix(out, env(biquad(noise(0.02), 'hp', 2500), (t) => Math.exp(-t / 0.003)), 0, 0.8);
  mix(out, tone(1.0, 55, 0.25), 0.01, 0.9);
  mix(out, tone(1.0, 110, 0.12), 0.01, 0.3);
  mix(out, env(biquad(noise(1.2), 'lp', 180), (t, d) => Math.min(1, t * 8) * (1 - t / d) * 0.25), 0);
  writeWav('light.wav', normalize(out, 0.8));
}

// Carta che scivola sul velluto
{
  const d = 1.7;
  let n = biquad(noise(d), 'bp', 2600, 0.6);
  n = biquad(n, 'lp', 5000);
  const out = env(n, (t) => {
    const a = Math.min(1, t / 0.12) * Math.exp(-Math.max(0, t - 0.2) / 0.45);
    return a * (0.8 + 0.2 * Math.sin(t * 60));
  });
  writeWav('slide.wav', normalize(out, 0.7));
}

// Giro della carta: fruscio d'aria + schiocco
{
  const out = buf(0.6);
  mix(out, env(biquad(noise(0.35), 'bp', 900, 0.5), (t, d) => Math.sin((Math.PI * t) / d) ** 2), 0, 0.5);
  mix(out, env(biquad(noise(0.08), 'hp', 1800), (t) => Math.exp(-t / 0.012)), 0.3, 1);
  mix(out, tone(0.1, 420, 0.02), 0.3, 0.3);
  writeWav('flip.wav', normalize(out, 0.8));
}

// Fruscio di carta
{
  const d = 0.9;
  const out = buf(d);
  for (let k = 0; k < 26; k++) {
    const at = Math.abs(rnd()) * (d - 0.1);
    const len = 0.01 + Math.abs(rnd()) * 0.04;
    mix(out, env(biquad(noise(len), 'bp', 3000 + rnd() * 1500, 0.8), (t, dd) => Math.sin((Math.PI * t) / dd)), at, 0.3 + Math.abs(rnd()) * 0.7);
  }
  writeWav('rustle.wav', normalize(env(out, (t, dd) => Math.sin((Math.PI * t) / dd)), 0.6));
}

// Scintillio dorato
{
  const out = buf(2.2);
  [2093, 2637, 3136, 3951, 4186, 5274].forEach((f, i) => {
    mix(out, env(tone(1.8, f, 0.5), (t) => Math.min(1, t / 0.01)), i * 0.07, 0.35);
    mix(out, tone(1.8, f * 2.01, 0.2), i * 0.07, 0.08);
  });
  writeWav('shimmer.wav', normalize(out, 0.6));
}

// Rulli della slot machine: tic sempre più lenti + ronzio meccanico
{
  const d = 2.8;
  const out = buf(d);
  let t = 0, gap = 0.035;
  while (t < d - 0.1) {
    mix(out, env(biquad(noise(0.012), 'bp', 3500, 1.5), (x) => Math.exp(-x / 0.003)), t, 0.6);
    t += gap;
    gap *= 1.035;
  }
  mix(out, env(biquad(noise(d), 'bp', 300, 2), (x, dd) => Math.min(1, x * 10) * (1 - x / dd)), 0, 0.25);
  writeWav('reels.wav', normalize(out, 0.6));
}

// Stop di un rullo
{
  const out = buf(0.25);
  mix(out, env(biquad(noise(0.02), 'hp', 1500), (t) => Math.exp(-t / 0.004)), 0, 0.7);
  mix(out, tone(0.2, 1250, 0.03), 0, 0.5);
  mix(out, tone(0.2, 180, 0.05), 0, 0.5);
  writeWav('tick.wav', normalize(out, 0.8));
}

// Fiche che cade sul tavolo
{
  const out = buf(0.35);
  mix(out, env(biquad(noise(0.03), 'bp', 4000, 1), (t) => Math.exp(-t / 0.004)), 0, 0.8);
  [3150, 4720, 6080, 2210].forEach((f, i) => mix(out, tone(0.3, f, 0.018 + i * 0.004), 0, 0.35));
  mix(out, tone(0.3, 240, 0.03), 0, 0.4);
  writeWav('chip.wav', normalize(out, 0.85));
}
