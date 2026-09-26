/**
 * ============================================================
 *  CONFIGURAZIONE DEL VIDEO — modifica qui testi, colori e tempi
 * ============================================================
 *  Tutti i tempi sono in SECONDI. Il video dura `durationInSeconds`.
 *  Dopo una modifica, Remotion Studio si aggiorna da solo.
 */

export const video = {
  fps: 30,
  durationInSeconds: 30,
  story: {width: 1080, height: 1920},
  square: {width: 1080, height: 1080},
};

export const colors = {
  black: '#0E0A0B', // nero profondo
  cream: '#F5EEDF', // crema carta
  bordeaux: '#8B1A1A', // rosso bordeaux
  gold: '#C9A96E', // accenti oro
  // colori derivati (tavolo, ombre, riflessi)
  velvet: '#1F0E10',
  velvetLight: '#3A1519',
  goldLight: '#F3E2B8',
};

export const fonts = {
  // Font titoli (Google Fonts): 'Playfair Display' oppure 'DM Serif Display'
  title: 'Playfair Display' as 'Playfair Display' | 'DM Serif Display',
  // Font scritte piccole
  label: 'Montserrat',
};

export const texts = {
  banner: 'INVITO PRIVATO',
  saveTheDate: 'SAVE THE DATE',
  name: 'BDAY MAMI',
  age: '25',
  day: 'VENERDÌ',
  date: '27.11.2026',
  venue: 'LE CHATEAU CLUB',
  venueDetail: 'Castello del Capitano delle Artiglierie',
  dressCodeLabel: 'DRESS CODE',
  dressCode: 'CASINO ROYALE',
};

/**
 * Tempi delle animazioni (secondi dall'inizio del video).
 * Ogni voce ha `start` e `duration`.
 */
export const timing = {
  // 1. Buio → luce sul tavolo → carta coperta che scivola
  spotlight: {start: 0.2, duration: 1.8},
  cardSlide: {start: 0.9, duration: 2.1},
  // 2. Giro della carta, simboli agli angoli, banner
  cardFlip: {start: 3.0, duration: 1.4},
  cornerSpades: {start: 4.2, duration: 0.9},
  banner: {start: 4.8, duration: 1.1},
  // 3. Grande picche disegnata → riempita → "25" con riflesso oro
  spadeDraw: {start: 6.0, duration: 2.0},
  spadeFill: {start: 7.7, duration: 1.2},
  age: {start: 8.9, duration: 1.0},
  ageShine: {start: 9.8, duration: 1.2},
  // 4. SAVE THE DATE lettera per lettera, poi BDAY MAMI
  saveTheDate: {start: 11.0, duration: 1.8},
  name: {start: 13.0, duration: 1.4},
  // 5. Linea, VENERDÌ, data con rulli slot machine
  line: {start: 15.0, duration: 1.0},
  day: {start: 15.8, duration: 1.0},
  dateSlot: {start: 16.8, duration: 2.8},
  // 6. Location
  venue: {start: 20.0, duration: 1.4},
  venueDetail: {start: 21.8, duration: 1.6},
  // 7. Dress code + fiches che cadono
  dressCode: {start: 25.0, duration: 1.4},
  chips: {start: 25.4, duration: 2.4},
  // 8. Zoom indietro, ultimo riflesso, dissolvenza al nero
  zoomOut: {start: 27.8, duration: 1.6},
  finalShine: {start: 28.2, duration: 1.2},
  fadeOut: {start: 29.0, duration: 1.0},
};

export const audio = {
  // Sostituisci public/musica.mp3 con il tuo brano (stesso nome file).
  music: 'musica.mp3',
  musicVolume: 0.8,
  musicFadeIn: 1.0, // secondi
  musicFadeOut: 2.0, // secondi (alla fine del video)
  sfxEnabled: true,
  sfxVolume: 0.6,
};

/** Effetti visivi */
export const fx = {
  grain: 0.07, // intensità grana (0 = disattivata)
  vignette: 0.65, // intensità vignettatura (0–1)
  cameraPushIn: 0.05, // lento avvicinamento durante il video (0.05 = +5%)
};
