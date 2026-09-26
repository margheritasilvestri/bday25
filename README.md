# Save the Date — 25° compleanno (Remotion)

Video animato in stile *Casino Royale*: la carta-invito prende vita su un tavolo di velluto.

| Composizione | Formato | File esportato |
|---|---|---|
| `SaveTheDateStory` | 1080×1920, 30 fps, 30 s | `output/save-the-date-story-1080x1920.mp4` |
| `SaveTheDateSquare` | 1080×1080, 30 fps, 30 s | `output/save-the-date-square-1080x1080.mp4` |

## Comandi

```bash
npm install          # la prima volta
npm run studio       # anteprima live in Remotion Studio (http://localhost:3000)
npm run render       # esporta i due MP4 nella cartella output/
npm run sfx          # rigenera gli effetti sonori in public/sfx/
```

## Cosa modificare

- **`src/config.ts`** → tutti i testi, i colori, i font, i tempi di ogni scena (in secondi),
  il volume di musica/effetti, grana e vignettatura.
- **`public/musica.mp3`** → ora è una traccia muta segnaposto di 30 s. Sostituiscila con il tuo
  brano (spy jazz / swing) mantenendo lo stesso nome; fade-in e fade-out sono automatici.
- **`public/sfx/`** → effetti sonori sintetizzati (fruscio carta, giro carta, rulli slot, fiches…).
  Puoi sostituirli con file tuoi dallo stesso nome.

## Struttura

```
src/
  config.ts              ← testi, colori, tempi
  Root.tsx               ← le due composizioni (verticale e quadrata)
  SaveTheDate.tsx        ← regia: tavolo, luce, carta che scivola e si gira, camera, fiches
  components/
    CardBack.tsx         ← dorso nero/bordeaux con motivo geometrico
    CardFront.tsx        ← fronte crema: banner, picche, 25, testi, data a rulli
    Decor.tsx            ← tavolo, fiches, riflesso di luce, grana, vignettatura
    Soundtrack.tsx       ← musica + effetti sonori sincronizzati
public/fonts/            ← Playfair Display, DM Serif Display, Montserrat (Google Fonts, OFL)
```
