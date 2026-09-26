import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fx} from '../config';
import {CARD_RADIUS, SPADE_PATH, SPADE_VIEWBOX} from '../lib';

/** Simbolo di picche pieno */
export const Spade: React.FC<{size: number; color: string; style?: React.CSSProperties}> = ({
  size,
  color,
  style,
}) => (
  <svg width={size} height={size * (108 / 112)} viewBox={SPADE_VIEWBOX} style={style}>
    <path d={SPADE_PATH} fill={color} />
  </svg>
);

/** Riflesso di luce che attraversa una superficie (p: 0→1) */
export const Sheen: React.FC<{p: number; strength?: number; width?: number; radius?: number}> = ({
  p,
  strength = 0.45,
  width = 34,
  radius = CARD_RADIUS,
}) => {
  if (p <= 0 || p >= 1) return null;
  const x = -60 + p * 220; // percentuale
  return (
    <AbsoluteFill style={{borderRadius: radius, overflow: 'hidden', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: `${x - width / 2}%`,
          width: `${width}%`,
          height: '200%',
          transform: 'rotate(18deg)',
          background: `linear-gradient(90deg, rgba(255,248,230,0) 0%, rgba(255,244,215,${strength * 0.5}) 38%, rgba(255,252,240,${strength}) 50%, rgba(255,244,215,${strength * 0.5}) 62%, rgba(255,248,230,0) 100%)`,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};

/** Grana pellicola animata */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  if (fx.grain <= 0) return null;
  // la grana cambia ogni 2 frame, spostando una texture più grande
  const step = Math.floor(frame / 2);
  const dx = Math.floor(random(`gx${step}`) * 200);
  const dy = Math.floor(random(`gy${step}`) * 200);
  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none', opacity: fx.grain * 2.2, mixBlendMode: 'overlay'}}>
      <svg
        width={width + 200}
        height={height + 200}
        style={{position: 'absolute', left: -dx, top: -dy}}
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={step % 7} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 85% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(8,4,5,${fx.vignette}) 100%)`,
    }}
  />
);

/** Tavolo in velluto scuro con fascio di luce dall'alto */
export const Table: React.FC<{light: number}> = ({light}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  return (
    <AbsoluteFill style={{backgroundColor: '#050304'}}>
      <AbsoluteFill style={{opacity: light}}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse ${portrait ? '85% 55%' : '70% 70%'} at 50% 47%, ${colors.velvetLight} 0%, ${colors.velvet} 45%, #0A0506 80%, #050304 100%)`,
          }}
        />
        {/* trama del velluto */}
        <svg width={width} height={height} style={{position: 'absolute', opacity: 0.35, mixBlendMode: 'multiply'}}>
          <filter id="velvet">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed={4} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#velvet)" />
        </svg>
        {/* alone caldo del faretto */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 45%, rgba(255,214,160,0.10) 0%, rgba(255,214,160,0.04) 30%, rgba(0,0,0,0) 55%)`,
            mixBlendMode: 'screen',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Fiche da casinò vista dall'alto */
export const Chip: React.FC<{size: number; color: string; accent: string; center: string}> = ({
  size,
  color,
  accent,
  center,
}) => {
  const inserts = Array.from({length: 8});
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <defs>
        <radialGradient id={`chipShade${color}`} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill={color} />
      {inserts.map((_, i) => (
        <rect
          key={i}
          x="88"
          y="3"
          width="24"
          height="30"
          rx="3"
          fill={accent}
          transform={`rotate(${i * 45} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="68" fill="none" stroke={accent} strokeWidth="2.5" strokeDasharray="6 5" />
      <circle cx="100" cy="100" r="58" fill={center} />
      <circle cx="100" cy="100" r="58" fill="none" stroke={colors.gold} strokeWidth="2" />
      <g transform="translate(70 68) scale(0.6)">
        <path d={SPADE_PATH} fill={color === colors.black ? colors.gold : colors.black} />
      </g>
      <circle cx="100" cy="100" r="98" fill={`url(#chipShade${color})`} />
      <circle cx="100" cy="100" r="97" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2" />
    </svg>
  );
};
