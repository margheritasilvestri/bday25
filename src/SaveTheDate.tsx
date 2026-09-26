import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fx, timing} from './config';
import {
  CARD_H,
  CARD_RADIUS,
  CARD_W,
  CHIP_B1,
  CHIP_B2,
  CHIP_FALL,
  EASE_IN_OUT,
  EASE_OUT,
  EASE_SOFT,
  chipStart,
  lerp,
  progress,
  sec,
} from './lib';
import {CardBack} from './components/CardBack';
import {CardFront} from './components/CardFront';
import {Chip, Grain, Table, Vignette} from './components/Decor';
import {Soundtrack} from './components/Soundtrack';

// ---------- Fiches ----------
type ChipDef = {x: number; y: number; size: number; kind: 'black' | 'bordeaux' | 'gold'; rot: number};

const CHIP_COLORS = {
  black: {color: colors.black, accent: colors.cream, center: colors.cream},
  bordeaux: {color: colors.bordeaux, accent: colors.cream, center: colors.cream},
  gold: {color: colors.gold, accent: colors.black, center: colors.cream},
};

// posizioni in pixel del fotogramma (prima dello zoom camera)
const CHIPS_STORY: ChipDef[] = [
  {x: 150, y: 135, size: 170, kind: 'black', rot: 12},
  {x: 935, y: 150, size: 165, kind: 'bordeaux', rot: -20},
  {x: 330, y: 100, size: 120, kind: 'gold', rot: 40},
  {x: 925, y: 1790, size: 170, kind: 'black', rot: -8},
  {x: 140, y: 1800, size: 165, kind: 'bordeaux', rot: 25},
  {x: 760, y: 1850, size: 120, kind: 'gold', rot: -35},
];
const CHIPS_SQUARE: ChipDef[] = [
  {x: 120, y: 290, size: 150, kind: 'black', rot: 12},
  {x: 965, y: 800, size: 150, kind: 'black', rot: -18},
  {x: 955, y: 270, size: 150, kind: 'bordeaux', rot: -20},
  {x: 110, y: 800, size: 150, kind: 'bordeaux', rot: 30},
  {x: 150, y: 545, size: 118, kind: 'gold', rot: 40},
  {x: 935, y: 540, size: 118, kind: 'gold', rot: -30},
];

const chipHeight = (t: number) => {
  if (t < 0) return 1;
  if (t < CHIP_FALL) return 1 - (t / CHIP_FALL) ** 2;
  let u = (t - CHIP_FALL) / CHIP_B1;
  if (u < 1) return 0.14 * 4 * u * (1 - u);
  u = (t - CHIP_FALL - CHIP_B1) / CHIP_B2;
  if (u < 1) return 0.035 * 4 * u * (1 - u);
  return 0;
};

const FallingChip: React.FC<{def: ChipDef; index: number}> = ({def, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps - chipStart(index);
  if (t < 0) return null;
  const h = chipHeight(t);
  const settle = Math.min(1, t / (CHIP_FALL + CHIP_B1 + CHIP_B2));
  const scale = 1 + h * 1.3;
  const rot = def.rot + (1 - EASE_OUT(settle)) * 140 * (index % 2 ? -1 : 1);
  const c = CHIP_COLORS[def.kind];
  return (
    <div style={{position: 'absolute', left: def.x - def.size / 2, top: def.y - def.size / 2, width: def.size, height: def.size}}>
      {/* ombra sul tavolo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.75)',
          transform: `translate(${10 + h * 60}px, ${14 + h * 90}px) scale(${1 + h * 0.4})`,
          filter: `blur(${6 + h * 22}px)`,
          opacity: lerp(0.9, 0.35, h),
        }}
      />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${scale}) rotate(${rot}deg)`, opacity: Math.min(1, t * 8)}}>
        <Chip size={def.size} {...c} />
      </div>
    </div>
  );
};

// ---------- Composizione ----------
export const SaveTheDate: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;

  // Scala della carta per adattarla al formato
  const cardScale = Math.min((width * 0.84) / CARD_W, (height * (portrait ? 0.73 : 0.86)) / CARD_H);

  // 1. Luce e ingresso della carta
  const lightRaw = progress(frame, timing.spotlight, EASE_SOFT);
  // piccolo "sfarfallio" della lampada che si accende
  const flicker =
    frame < sec(timing.spotlight.start + 0.5)
      ? interpolate(frame % 4, [0, 1, 2, 3], [0.4, 1, 0.6, 0.9])
      : 1;
  const light = lightRaw * flicker;

  const slide = progress(frame, timing.cardSlide, EASE_OUT);
  const tx = lerp(width * 0.55, 0, slide);
  const ty = lerp(height * 0.75, 0, slide);
  const rotZ = lerp(26, 0, slide);

  // 2. Giro 3D
  const flip = progress(frame, timing.cardFlip, EASE_IN_OUT);
  const rotY = flip * 180;
  const lift = Math.sin(Math.PI * flip);
  const faceShade = Math.abs(Math.cos((rotY * Math.PI) / 180)); // luce che cambia durante il giro

  // Riflessi di luce sulla carta
  const flipEnd = timing.cardFlip.start + timing.cardFlip.duration;
  const sheenA = progress(frame, {start: flipEnd - 0.1, duration: 1.3}, EASE_IN_OUT);
  const sheenB = progress(frame, timing.finalShine, EASE_IN_OUT);
  const sheen = sheenA > 0 && sheenA < 1 ? sheenA : sheenB;

  // 8. Camera: lento avvicinamento, poi zoom indietro finale
  const push = fx.cameraPushIn * progress(frame, {start: flipEnd, duration: timing.zoomOut.start - flipEnd}, EASE_SOFT);
  const zoomOut = progress(frame, timing.zoomOut, EASE_IN_OUT);
  const cam = lerp(1 + push, 0.95, zoomOut);

  const fadeOut = progress(frame, timing.fadeOut, EASE_SOFT);

  const chips = portrait ? CHIPS_STORY : CHIPS_SQUARE;

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${cam})`}}>
        <Table light={light} />

        {/* Carta */}
        {slide > 0 && (
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div
              style={{
                width: CARD_W,
                height: CARD_H,
                position: 'relative',
                flexShrink: 0,
                transform: `translate(${tx}px, ${ty}px) rotate(${rotZ}deg) scale(${cardScale})`,
              }}
            >
              {/* ombra della carta sul velluto */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: CARD_RADIUS,
                  background: 'rgba(0,0,0,0.85)',
                  transform: `translate(${16 + lift * 40}px, ${30 + lift * 70}px) scaleX(${lerp(1, 0.2, lift * lift) * 0.98 + 0.02})`,
                  filter: `blur(${34 + lift * 30}px)`,
                  opacity: light * lerp(0.9, 0.55, lift),
                }}
              />
              <div style={{position: 'absolute', inset: 0, perspective: 3200}}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transformStyle: 'preserve-3d',
                    transform: `translateZ(${lift * 70}px) rotateY(${rotY}deg) rotateX(${lift * 4}deg)`,
                  }}
                >
                  {/* dorso */}
                  <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'}}>
                    <CardBack />
                    <div style={{position: 'absolute', inset: 0, borderRadius: CARD_RADIUS, background: '#000', opacity: (1 - faceShade) * 0.6}} />
                  </div>
                  {/* fronte */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    {flip > 0.3 && <CardFront sheen={sheen} />}
                    <div style={{position: 'absolute', inset: 0, borderRadius: CARD_RADIUS, background: '#000', opacity: (1 - faceShade) * 0.5}} />
                  </div>
                </div>
              </div>
            </div>
          </AbsoluteFill>
        )}

        {/* 7. Fiches */}
        {chips.map((c, i) => (
          <FallingChip key={i} def={c} index={i} />
        ))}
      </AbsoluteFill>

      <Vignette />
      <Grain />
      {/* buio iniziale e dissolvenza finale */}
      <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(fadeOut, 1 - Math.min(1, lightRaw * 1.5))}} />

      <Soundtrack />
    </AbsoluteFill>
  );
};
