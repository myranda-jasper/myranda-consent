from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
OUT = "public/banner.png"

TITLE_FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
SUB_FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


# --- background: subtle vertical gradient in deep brand purple ---
bg_top = (31, 16, 52)    # ~#1f1034
bg_bot = (16, 7, 24)     # ~#100718
img = Image.new("RGB", (W, H), bg_top)
d = ImageDraw.Draw(img)
for y in range(H):
    d.line([(0, y), (W, y)], fill=lerp(bg_top, bg_bot, y / (H - 1)))

# --- soft accent glow behind the centre ---
glow = Image.new("L", (W, H), 0)
gd = ImageDraw.Draw(glow)
cx, cy, maxr = 640, 330, 540
for r in range(maxr, 0, -2):
    a = int(105 * (1 - r / maxr) ** 2.2)
    gd.ellipse([cx - r, cy - int(r * 0.78), cx + r, cy + int(r * 0.78)], fill=a)
accent_glow = Image.new("RGB", (W, H), (122, 56, 184))
img = Image.composite(accent_glow, img, glow)
d = ImageDraw.Draw(img)

# --- padlock motif (purple -> pink gradient through a mask) ---
LW, LH = 150, 200
lx, ly = (W - LW) // 2, 120

grad = Image.new("RGB", (LW, LH))
gdr = ImageDraw.Draw(grad)
c1, c2 = (139, 63, 217), (217, 111, 217)   # #8b3fd9 -> #d96fd9
for y in range(LH):
    gdr.line([(0, y), (LW, y)], fill=lerp(c1, c2, y / (LH - 1)))

mask = Image.new("L", (LW, LH), 0)
m = ImageDraw.Draw(mask)
# shackle (inverted-U arc), ends meeting the body top
m.arc([45, 26, 105, 138], start=180, end=360, fill=255, width=15)
# body
m.rounded_rectangle([16, 82, 134, 190], radius=22, fill=255)
# keyhole cut-out
m.ellipse([66, 116, 84, 134], fill=0)
m.polygon([(72, 130), (78, 130), (82, 158), (68, 158)], fill=0)
img.paste(grad, (lx, ly), mask)

# --- title ---
title = "Myranda Consent"
tf = ImageFont.truetype(TITLE_FONT, 98)
tb = d.textbbox((0, 0), title, font=tf)
d.text(((W - (tb[2] - tb[0])) // 2 - tb[0], 360), title, font=tf, fill=(246, 241, 255))

# --- accent divider ---
d.rounded_rectangle([W // 2 - 70, 487, W // 2 + 70, 492], radius=3, fill=(199, 99, 220))

# --- subtitle ---
sub = "Your data. Your keys. Your consent, on the record."
sf = ImageFont.truetype(SUB_FONT, 33)
sbb = d.textbbox((0, 0), sub, font=sf)
d.text(((W - (sbb[2] - sbb[0])) // 2 - sbb[0], 512), sub, font=sf, fill=(206, 186, 238))

img.save(OUT)
print("saved", OUT, img.size)
