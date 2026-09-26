import React from 'react';
import {Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {colors, texts, timing} from '../config';
import {
  CARD_H,
  CARD_RADIUS,
  CARD_W,
  EASE_IN_OUT,
  EASE_OUT,
  EASE_SOFT,
  LABEL_FONT,
  SPADE_PATH,
  SPADE_VIEWBOX,
  TITLE_BOLD,
  TITLE_FONT,
  progress,
  sec,
  lerp,
} from '../lib';
import {Sheen, Spade} from './Decor';

const center: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  width: CARD_W,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  whiteSpace: 'nowrap',
};

/** Comparsa morbida: dissolvenza + leggero sollevamento + messa a fuoco */
const reveal = (p: number, rise = 18): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * rise}px)`,
  filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
});

// ---------- Paper ----------
const Paper: React.FC = () => (
  <svg width={CARD_W} height={CARD_H} style={{position: 'absolute', inset: 0}}>
    <defs>
      <filter id="paper">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed={2} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.25  0 0 0 0.10 0" />
      </filter>
      <radialGradient id="paperShade" cx="50%" cy="42%" r="75%">
        <stop offset="60%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#5a3a1a" stopOpacity="0.16" />
      </radialGradient>
    </defs>
    <rect width={CARD_W} height={CARD_H} rx={CARD_RADIUS} fill={colors.cream} />
    <rect width={CARD_W} height={CARD_H} rx={CARD_RADIUS} filter="url(#paper)" />
    <rect width={CARD_W} height={CARD_H} rx={CARD_RADIUS} fill="url(#paperShade)" />
    {/* doppia cornice oro */}
    <rect x="26" y="26" width={CARD_W - 52} height={CARD_H - 52} rx="24" fill="none" stroke={colors.gold} strokeWidth="3" />
    <rect x="38" y="38" width={CARD_W - 76} height={CARD_H - 76} rx="16" fill="none" stroke={colors.gold} strokeWidth="1" />
  </svg>
);

// ---------- Corner spades ----------
const Corners: React.FC<{p: number}> = ({p}) => {
  const style = (rot: number): React.CSSProperties => ({
    position: 'absolute',
    opacity: p,
    transform: `rotate(${rot}deg) scale(${lerp(0.6, 1, p)})`,
  });
  return (
    <>
      <div style={{...style(0), left: 68, top: 64}}>
        <Spade size={54} color={colors.black} />
      </div>
      <div style={{...style(180), right: 68, bottom: 64}}>
        <Spade size={54} color={colors.black} />
      </div>
    </>
  );
};

// ---------- Banner ----------
const Banner: React.FC<{p: number; textP: number}> = ({p, textP}) => {
  const w = 440;
  const h = 64;
  const notch = 22;
  const clip = `inset(0 ${(1 - p) * 50}% 0 ${(1 - p) * 50}%)`;
  return (
    <div style={{...center, top: 118, height: h}}>
      <div style={{position: 'relative', width: w, height: h, clipPath: clip}}>
        <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
          <path
            d={`M0 0 L${w} 0 L${w - notch} ${h / 2} L${w} ${h} L0 ${h} L${notch} ${h / 2} Z`}
            fill={colors.bordeaux}
          />
          <path
            d={`M${notch + 14} 8 L${w - notch - 14} 8 M${notch + 14} ${h - 8} L${w - notch - 14} ${h - 8}`}
            stroke={colors.gold}
            strokeWidth="1.2"
          />
        </svg>
        <div
          style={{
            ...center,
            width: w,
            top: 0,
            height: h,
            fontFamily: LABEL_FONT,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: '0.42em',
            paddingLeft: '0.42em',
            color: colors.cream,
            opacity: textP,
          }}
        >
          {texts.banner}
        </div>
      </div>
    </div>
  );
};

// ---------- Letter by letter ----------
const Letters: React.FC<{text: string; frame: number}> = ({text, frame}) => {
  const chars = [...text];
  const each = 0.55;
  const stagger = (timing.saveTheDate.duration - each) / Math.max(1, chars.length - 1);
  return (
    <>
      {chars.map((c, i) => {
        const p = progress(frame, {start: timing.saveTheDate.start + i * stagger, duration: each}, EASE_OUT);
        return (
          <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', ...reveal(p, 14)}}>
            {c}
          </span>
        );
      })}
    </>
  );
};

// ---------- Big spade + 25 ----------
const BigSpade: React.FC<{frame: number}> = ({frame}) => {
  const size = 360;
  const draw = progress(frame, timing.spadeDraw, EASE_IN_OUT);
  const fill = progress(frame, timing.spadeFill, EASE_SOFT);
  const age = progress(frame, timing.age, EASE_OUT);
  const shine = progress(frame, timing.ageShine, EASE_IN_OUT);
  const finalShine = progress(frame, timing.finalShine, EASE_IN_OUT);
  const shineP = shine > 0 && shine < 1 ? shine : finalShine > 0 && finalShine < 1 ? finalShine : -1;
  // posizione della banda dorata nel testo (background-position)
  const bandPos = shineP < 0 ? 0 : lerp(130, -30, shineP);
  return (
    <div style={{...center, top: 425, height: size * (108 / 112)}}>
      <div style={{position: 'relative', width: size, height: size * (108 / 112)}}>
        <svg width={size} height={size * (108 / 112)} viewBox={SPADE_VIEWBOX} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <path
            d={SPADE_PATH}
            fill={colors.black}
            fillOpacity={fill}
            stroke={colors.black}
            strokeWidth={0.9}
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - draw}
          />
          {/* filo d'oro interno che appare col riempimento */}
          <path
            d={SPADE_PATH}
            fill="none"
            stroke={colors.gold}
            strokeWidth={0.5}
            opacity={fill * 0.9}
            transform="translate(50 54) scale(0.9) translate(-50 -54)"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: size,
            top: 88,
            textAlign: 'center',
            fontFamily: TITLE_FONT,
            fontWeight: TITLE_BOLD,
            fontSize: 158,
            lineHeight: 1,
            letterSpacing: '-0.01em',
            opacity: age,
            transform: `scale(${lerp(0.86, 1, age)})`,
            filter: age < 1 ? `blur(${(1 - age) * 8}px)` : undefined,
            backgroundImage: `linear-gradient(105deg, ${colors.cream} 0%, ${colors.cream} 40%, ${colors.gold} 46%, ${colors.goldLight} 50%, ${colors.gold} 54%, ${colors.cream} 60%, ${colors.cream} 100%)`,
            backgroundSize: '300% 100%',
            backgroundPosition: `${bandPos}% 0`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {texts.age}
        </div>
      </div>
    </div>
  );
};

// ---------- Slot machine date ----------
const REEL_LEN = 14;
const SlotDate: React.FC<{frame: number}> = ({frame}) => {
  const fontSize = 104;
  const rowH = fontSize * 1.18;
  const chars = [...texts.date];
  const digitIdx = chars.map((c, i) => (/\d/.test(c) ? i : -1)).filter((i) => i >= 0);
  const appear = progress(frame, {start: timing.dateSlot.start, duration: 0.4}, EASE_OUT);
  const spinDur = timing.dateSlot.duration * 0.55;
  const stagger = (timing.dateSlot.duration - spinDur) / Math.max(1, digitIdx.length - 1);
  return (
    <div style={{...center, top: 900, height: rowH, opacity: appear}}>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) {
          return (
            <span key={i} style={{fontFamily: TITLE_FONT, fontWeight: 700, fontSize, color: colors.black, lineHeight: `${rowH}px`, margin: '0 2px'}}>
              {c}
            </span>
          );
        }
        const order = digitIdx.indexOf(i);
        const start = sec(timing.dateSlot.start + order * stagger);
        const end = start + sec(spinDur);
        const t = (f: number) =>
          interpolate(f, [start, end], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.back(1.1)),
          });
        const p = t(frame);
        const speed = Math.abs(t(frame + 1) - p) * REEL_LEN;
        // una cifra in più dopo quella finale, visibile durante il piccolo rimbalzo
        const reel = Array.from({length: REEL_LEN + 1}, (_, k) =>
          k === REEL_LEN - 1 ? c : String(Math.floor(random(`reel${i}-${k}`) * 10)),
        );
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              position: 'relative',
              width: fontSize * 0.64,
              height: rowH,
              overflow: 'hidden',
              WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                transform: `translateY(${-p * (REEL_LEN - 1) * rowH}px)`,
                filter: speed > 0.05 ? `blur(${Math.min(4, speed * 3.5)}px)` : undefined,
              }}
            >
              {reel.map((d, k) => (
                <span
                  key={k}
                  style={{
                    display: 'block',
                    height: rowH,
                    lineHeight: `${rowH}px`,
                    textAlign: 'center',
                    fontFamily: TITLE_FONT,
                    fontWeight: 700,
                    fontSize,
                    fontVariantNumeric: 'lining-nums tabular-nums',
                    color: colors.black,
                  }}
                >
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// ---------- Card front ----------
export const CardFront: React.FC<{sheen: number}> = ({sheen}) => {
  const frame = useCurrentFrame();

  const corners = progress(frame, timing.cornerSpades, EASE_OUT);
  const banner = progress(frame, timing.banner, EASE_IN_OUT);
  const bannerText = progress(frame, {start: timing.banner.start + timing.banner.duration * 0.55, duration: 0.7});
  const name = progress(frame, timing.name, EASE_OUT);
  const line = progress(frame, timing.line, EASE_IN_OUT);
  const day = progress(frame, timing.day, EASE_OUT);
  const venue = progress(frame, timing.venue, EASE_OUT);
  const venueDetail = progress(frame, timing.venueDetail, EASE_OUT);
  const dress = progress(frame, timing.dressCode, EASE_OUT);
  const dressFrame = progress(frame, {start: timing.dressCode.start, duration: timing.dressCode.duration * 1.2}, EASE_IN_OUT);

  return (
    <div style={{position: 'relative', width: CARD_W, height: CARD_H, borderRadius: CARD_RADIUS, overflow: 'hidden'}}>
      <Paper />
      <Corners p={corners} />
      <Banner p={banner} textP={bannerText} />

      {/* SAVE THE DATE */}
      <div
        style={{
          ...center,
          top: 216,
          height: 66,
          fontFamily: TITLE_FONT,
          fontWeight: 700,
          fontSize: 52,
          letterSpacing: '0.14em',
          paddingLeft: '0.14em',
          color: colors.bordeaux,
        }}
      >
        <Letters text={texts.saveTheDate} frame={frame} />
      </div>

      {/* BDAY MAMI */}
      <div
        style={{
          ...center,
          top: 288,
          height: 120,
          fontFamily: TITLE_FONT,
          fontWeight: TITLE_BOLD,
          fontSize: 108,
          lineHeight: 1,
          color: colors.black,
          letterSpacing: `${lerp(0.14, 0.02, name)}em`,
          paddingLeft: `${lerp(0.14, 0.02, name)}em`,
          opacity: name,
          filter: name < 1 ? `blur(${(1 - name) * 7}px)` : undefined,
        }}
      >
        {texts.name}
      </div>

      <BigSpade frame={frame} />

      {/* Linea sottile con diamante */}
      <div style={{...center, top: 812, height: 20}}>
        <svg width={420} height={20} style={{transform: `scaleX(${line})`}}>
          <line x1="0" y1="10" x2="186" y2="10" stroke={colors.black} strokeWidth="1.4" />
          <line x1="234" y1="10" x2="420" y2="10" stroke={colors.black} strokeWidth="1.4" />
          <path d="M210 2 L218 10 L210 18 L202 10 Z" fill={colors.gold} opacity={line} />
        </svg>
      </div>

      {/* VENERDÌ */}
      <div
        style={{
          ...center,
          top: 848,
          height: 44,
          fontFamily: LABEL_FONT,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: '0.5em',
          paddingLeft: '0.5em',
          color: colors.bordeaux,
          ...reveal(day),
        }}
      >
        {texts.day}
      </div>

      <SlotDate frame={frame} />

      {/* LE CHATEAU CLUB */}
      <div
        style={{
          ...center,
          top: 1060,
          height: 46,
          fontFamily: LABEL_FONT,
          fontWeight: 600,
          fontSize: 34,
          letterSpacing: `${lerp(0.5, 0.32, venue)}em`,
          paddingLeft: `${lerp(0.5, 0.32, venue)}em`,
          color: colors.black,
          ...reveal(venue, 10),
        }}
      >
        {texts.venue}
      </div>

      {/* Castello... in corsivo, rivelato da sinistra a destra */}
      <div
        style={{
          ...center,
          top: 1112,
          height: 48,
          fontFamily: TITLE_FONT,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 34,
          color: colors.bordeaux,
          opacity: Math.min(1, venueDetail * 1.6),
          WebkitMaskImage: `linear-gradient(90deg, #000 ${venueDetail * 120 - 20}%, transparent ${venueDetail * 120}%)`,
        }}
      >
        {texts.venueDetail}
      </div>

      {/* DRESS CODE */}
      <div style={{...center, top: 1188, height: 118}}>
        <div style={{position: 'relative', width: 470, height: 118}}>
          <svg width={470} height={118} style={{position: 'absolute', inset: 0}}>
            <rect
              x="1"
              y="1"
              width="468"
              height="116"
              fill="none"
              stroke={colors.bordeaux}
              strokeWidth="1.6"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - dressFrame}
            />
          </svg>
          <div
            style={{
              ...center,
              width: 470,
              top: 18,
              height: 26,
              fontFamily: LABEL_FONT,
              fontWeight: 500,
              fontSize: 19,
              letterSpacing: '0.55em',
              paddingLeft: '0.55em',
              color: colors.black,
              ...reveal(dress, 8),
            }}
          >
            {texts.dressCodeLabel}
          </div>
          <div
            style={{
              ...center,
              width: 470,
              top: 48,
              height: 56,
              fontFamily: TITLE_FONT,
              fontWeight: 700,
              fontSize: 44,
              letterSpacing: '0.08em',
              paddingLeft: '0.08em',
              color: colors.bordeaux,
              ...reveal(progress(frame, timing.dressCode, EASE_OUT, 0.3), 10),
            }}
          >
            {texts.dressCode}
          </div>
        </div>
      </div>

      <Sheen p={sheen} />
    </div>
  );
};
