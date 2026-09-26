import React from 'react';
import {colors} from '../config';
import {CARD_H, CARD_RADIUS, CARD_W, SPADE_PATH} from '../lib';

/** Dorso della carta: nero e bordeaux con motivo geometrico art-déco */
export const CardBack: React.FC = () => {
  const inset = 44;
  const w = CARD_W - inset * 2;
  const h = CARD_H - inset * 2;
  return (
    <svg width={CARD_W} height={CARD_H} viewBox={`0 0 ${CARD_W} ${CARD_H}`} style={{display: 'block', borderRadius: CARD_RADIUS}}>
      <defs>
        <pattern id="lattice" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill={colors.black} />
          <path d="M30 0 L60 30 L30 60 L0 30 Z" fill={colors.bordeaux} opacity="0.9" />
          <path d="M30 10 L50 30 L30 50 L10 30 Z" fill="none" stroke={colors.black} strokeWidth="2.5" />
          <path d="M30 19 L41 30 L30 41 L19 30 Z" fill={colors.gold} opacity="0.55" />
          <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke={colors.gold} strokeWidth="0.8" opacity="0.6" />
        </pattern>
        <radialGradient id="backGlow" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <rect width={CARD_W} height={CARD_H} rx={CARD_RADIUS} fill={colors.black} />
      <rect x={inset} y={inset} width={w} height={h} fill="url(#lattice)" />
      {/* cornici */}
      <rect x={inset} y={inset} width={w} height={h} fill="none" stroke={colors.gold} strokeWidth="4" />
      <rect x={inset - 16} y={inset - 16} width={w + 32} height={h + 32} rx="20" fill="none" stroke={colors.gold} strokeWidth="1.5" opacity="0.8" />
      <rect x={inset + 14} y={inset + 14} width={w - 28} height={h - 28} fill="none" stroke={colors.black} strokeWidth="10" />
      <rect x={inset + 20} y={inset + 20} width={w - 40} height={h - 40} fill="none" stroke={colors.gold} strokeWidth="1.2" />
      {/* medaglione centrale */}
      <g transform={`translate(${CARD_W / 2} ${CARD_H / 2})`}>
        <path d="M0 -230 L170 0 L0 230 L-170 0 Z" fill={colors.black} stroke={colors.gold} strokeWidth="4" />
        <path d="M0 -205 L150 0 L0 205 L-150 0 Z" fill="none" stroke={colors.gold} strokeWidth="1.2" />
        <circle r="95" fill={colors.bordeaux} stroke={colors.gold} strokeWidth="3" />
        <circle r="82" fill="none" stroke={colors.gold} strokeWidth="1" strokeDasharray="4 6" />
        <g transform="translate(-45 -48) scale(0.9)">
          <path d={SPADE_PATH} fill={colors.gold} />
        </g>
      </g>
      <rect width={CARD_W} height={CARD_H} rx={CARD_RADIUS} fill="url(#backGlow)" />
    </svg>
  );
};
