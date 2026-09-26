import React from 'react';
import {Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {audio, texts, timing} from '../config';
import {CHIP_B1, CHIP_B2, CHIP_COUNT, CHIP_FALL, chipStart, sec} from '../lib';

type Cue = {file: string; at: number; volume?: number};

/** Elenco degli effetti sonori, sincronizzati con i tempi in config.ts */
const buildCues = (): Cue[] => {
  const cues: Cue[] = [
    {file: 'light.wav', at: timing.spotlight.start, volume: 0.7},
    {file: 'slide.wav', at: timing.cardSlide.start, volume: 0.8},
    {file: 'flip.wav', at: timing.cardFlip.start + timing.cardFlip.duration * 0.35, volume: 0.9},
    {file: 'rustle.wav', at: timing.banner.start, volume: 0.45},
    {file: 'shimmer.wav', at: timing.ageShine.start, volume: 0.5},
    {file: 'reels.wav', at: timing.dateSlot.start, volume: 0.35},
    {file: 'shimmer.wav', at: timing.finalShine.start, volume: 0.45},
  ];
  // "clic" dei rulli che si fermano, uno per cifra
  const digits = [...texts.date].filter((c) => /\d/.test(c)).length;
  const spinDur = timing.dateSlot.duration * 0.55;
  const stagger = (timing.dateSlot.duration - spinDur) / Math.max(1, digits - 1);
  for (let i = 0; i < digits; i++) {
    cues.push({file: 'tick.wav', at: timing.dateSlot.start + i * stagger + spinDur * 0.8, volume: 0.6});
  }
  // fiches: impatto + due piccoli rimbalzi
  for (let i = 0; i < CHIP_COUNT; i++) {
    const s = chipStart(i) + CHIP_FALL;
    cues.push({file: 'chip.wav', at: s, volume: 0.9});
    cues.push({file: 'chip.wav', at: s + CHIP_B1, volume: 0.35});
    cues.push({file: 'chip.wav', at: s + CHIP_B1 + CHIP_B2, volume: 0.12});
  }
  return cues;
};

export const Soundtrack: React.FC = () => {
  const {durationInFrames, fps} = useVideoConfig();
  const fadeIn = sec(audio.musicFadeIn);
  const fadeOutStart = durationInFrames - sec(audio.musicFadeOut);
  return (
    <>
      <Audio
        src={staticFile(audio.music)}
        volume={(f) =>
          audio.musicVolume *
          interpolate(f, [0, fadeIn, fadeOutStart, durationInFrames], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />
      {audio.sfxEnabled &&
        buildCues().map((c, i) => (
          <Sequence key={i} from={Math.round(c.at * fps)} layout="none" name={`sfx ${c.file}`}>
            <Audio src={staticFile(`sfx/${c.file}`)} volume={audio.sfxVolume * (c.volume ?? 1)} />
          </Sequence>
        ))}
    </>
  );
};
