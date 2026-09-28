"""Ritratto con l'asso di picche stretto tra le labbra.

Livelli (dal basso): ritratto originale -> ombra della carta -> carta -> labbra ritagliate.
Uso: python3 scripts/compose-card-lips.py   (richiede Pillow e numpy)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / "ritratto-asso"
PORTRAIT = ROOT / "originali" / "ritratto.jpg"
CARD = ROOT / "originali" / "asso-di-picche.jpg"

# --- parametri principali -------------------------------------------------
CARD_WIDTH = 235          # px, circa la larghezza della bocca (~262 px)
CARD_ANGLE = 18           # gradi: la carta sporge in basso a destra
CARD_TOP = (1436, 1098)   # centro del bordo superiore (nascosto nella bocca)
MOUTH_LINE_Y = 1118       # linea tra le labbra: sopra non si vede la carta
WARM = (1.0, 0.965, 0.89) # tinta calda del bianco
SS = 4                    # supersampling per bordi puliti

# Contorno delle labbra (coordinate del ritratto originale 2576x1932)
LIPS = [
    (1310, 1112), (1325, 1097), (1355, 1090), (1380, 1085), (1410, 1074),
    (1435, 1069), (1455, 1064), (1470, 1071), (1485, 1074), (1500, 1069),
    (1515, 1065), (1530, 1069), (1550, 1077), (1565, 1085), (1573, 1095),
    (1575, 1110), (1573, 1118), (1565, 1128), (1562, 1145), (1557, 1160),
    (1545, 1172), (1520, 1185), (1490, 1192), (1465, 1193), (1435, 1190),
    (1400, 1180), (1370, 1165), (1345, 1147), (1330, 1132), (1315, 1120),
]


def build_card() -> Image.Image:
    """Carta rimpicciolita, angoli arrotondati, bianco scaldato (RGBA, non ruotata)."""
    src = Image.open(CARD).convert("RGB")
    w = CARD_WIDTH * SS
    h = round(w * src.height / src.width)
    card = src.resize((w, h), Image.LANCZOS)

    arr = np.asarray(card).astype(np.float32)
    arr *= np.array(WARM, dtype=np.float32)
    arr = arr * 0.97  # un filo meno brillante, come la luce della foto
    card = Image.fromarray(arr.clip(0, 255).astype(np.uint8))

    # leggera ombreggiatura verticale: la parte vicina alla bocca è più in ombra
    grad = np.linspace(0.86, 1.0, h, dtype=np.float32)[:, None, None]
    arr = np.asarray(card).astype(np.float32) * grad
    card = Image.fromarray(arr.clip(0, 255).astype(np.uint8)).convert("RGBA")

    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=int(w * 0.05), fill=255)
    card.putalpha(mask)
    return card


def place_card(size) -> Image.Image:
    """Ruota la carta attorno al centro del bordo superiore e la posiziona sul canvas."""
    card = build_card()
    w, h = card.size
    pad = max(w, h)
    canvas = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    canvas.paste(card, (pad, pad))
    pivot = (pad + w / 2, pad)
    rotated = canvas.rotate(CARD_ANGLE, resample=Image.BICUBIC, center=pivot)

    full = Image.new("RGBA", (size[0] * SS, size[1] * SS), (0, 0, 0, 0))
    ox = round(CARD_TOP[0] * SS - pivot[0])
    oy = round(CARD_TOP[1] * SS - pivot[1])
    full.paste(rotated, (ox, oy), rotated)
    return full.resize(size, Image.LANCZOS)


def lips_mask(size) -> Image.Image:
    m = Image.new("L", (size[0] * SS, size[1] * SS), 0)
    ImageDraw.Draw(m).polygon([(x * SS, y * SS) for x, y in LIPS], fill=255)
    return m.resize(size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.6))


def below_mouth(size) -> Image.Image:
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rectangle((0, MOUTH_LINE_Y, size[0], size[1]), fill=255)
    return m


def main():
    portrait = Image.open(PORTRAIT).convert("RGB")
    size = portrait.size

    card = place_card(size)
    clip = below_mouth(size)
    card.putalpha(ImageChops.multiply(card.getchannel("A"), clip))

    lips = lips_mask(size)

    # ombra di contatto del labbro inferiore sulla carta
    contact = lips.transform(size, Image.AFFINE, (1, 0, -2, 0, 1, -6)).filter(ImageFilter.GaussianBlur(7))
    contact = ImageChops.multiply(contact, card.getchannel("A"))
    shade = Image.new("RGBA", size, (45, 28, 18, 0))
    shade.putalpha(contact.point(lambda v: int(v * 0.55)))
    card_shaded = Image.alpha_composite(card, shade)
    card_shaded.putalpha(card.getchannel("A"))

    # ombra morbida verso il basso
    shadow_a = card.getchannel("A").transform(size, Image.AFFINE, (1, 0, -10, 0, 1, -18))
    shadow_a = shadow_a.filter(ImageFilter.GaussianBlur(14))
    shadow_a = ImageChops.multiply(shadow_a, clip).point(lambda v: int(v * 0.38))
    shadow = Image.new("RGBA", size, (50, 32, 18, 0))
    shadow.putalpha(shadow_a)

    lips_layer = portrait.convert("RGBA")
    lips_layer.putalpha(lips)

    out = portrait.convert("RGBA")
    for layer in (shadow, card_shaded, lips_layer):
        out = Image.alpha_composite(out, layer)
    out = out.convert("RGB")

    (ROOT / "livelli").mkdir(exist_ok=True)
    shadow.save(ROOT / "livelli" / "1-ombra.png")
    card_shaded.save(ROOT / "livelli" / "2-carta.png")
    lips_layer.save(ROOT / "livelli" / "3-labbra.png")

    icc = Image.open(PORTRAIT).info.get("icc_profile")
    out.save(ROOT / "ritratto-con-asso.png", icc_profile=icc)
    out.save(ROOT / "ritratto-con-asso.jpg", quality=95, subsampling=0, icc_profile=icc)
    print("salvato", out.size)


if __name__ == "__main__":
    main()
