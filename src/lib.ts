import {Easing, continueRender, delayRender, interpolate, staticFile} from 'remotion';
import {fonts, timing, video} from './config';

// ---- Font (file locali in public/fonts, così il render funziona anche offline) ----
const FONT_FILES: {family: string; file: string; style: string; weight: string}[] = [
  {family: 'Playfair Display', file: 'PlayfairDisplay.woff2', style: 'normal', weight: '400 900'},
  {family: 'Playfair Display', file: 'PlayfairDisplay-Italic.woff2', style: 'italic', weight: '400 900'},
  {family: 'DM Serif Display', file: 'DMSerifDisplay.woff2', style: 'normal', weight: '400'},
  {family: 'DM Serif Display', file: 'DMSerifDisplay-Italic.woff2', style: 'italic', weight: '400'},
  {family: 'Montserrat', file: 'Montserrat.woff2', style: 'normal', weight: '400 600'},
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Caricamento font');
  Promise.all(
    FONT_FILES.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format('woff2')`, {
        style: f.style,
        weight: f.weight,
      });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}

export const TITLE_FONT = `'${fonts.title}', serif`;
export const LABEL_FONT = `'${fonts.label}', sans-serif`;
// DM Serif Display ha un solo peso: usiamo 400 invece di 900
export const TITLE_BOLD = fonts.title === 'DM Serif Display' ? 400 : 900;

// ---- Tempo ----
export type Span = {start: number; duration: number};

export const sec = (s: number) => Math.round(s * video.fps);

// Curve morbide, "cinematografiche"
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_SOFT = Easing.bezier(0.33, 0, 0.2, 1);

/** Avanzamento 0→1 di uno span (in secondi) al frame dato. */
export const progress = (
  frame: number,
  span: Span,
  easing: (t: number) => number = EASE_OUT,
  offsetSeconds = 0,
) => {
  const start = (span.start + offsetSeconds) * video.fps;
  const end = start + span.duration * video.fps;
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Dimensioni "native" della carta; viene poi scalata per ogni formato. */
export const CARD_W = 900;
export const CARD_H = 1400;
export const CARD_RADIUS = 38;

/** Tracciato del simbolo di picche (viewBox -6 0 112 108) */
export const SPADE_PATH =
  'M50 2 C 50 2 20 30 8 48 C -4 66 8 88 28 86 C 38 85 44 79 46 74 C 45 86 40 96 30 104 L 70 104 C 60 96 55 86 54 74 C 56 79 62 85 72 86 C 92 88 104 66 92 48 C 80 30 50 2 50 2 Z';
export const SPADE_VIEWBOX = '-6 0 112 108';

/** Tempi di caduta/rimbalzo di una fiche (secondi dall'inizio della sua caduta) */
export const CHIP_COUNT = 6;
export const CHIP_FALL = 0.55;
export const CHIP_B1 = 0.3;
export const CHIP_B2 = 0.16;
export const chipStart = (i: number) =>
  timing.chips.start + i * ((timing.chips.duration - (CHIP_FALL + CHIP_B1 + CHIP_B2)) / (CHIP_COUNT - 1));
