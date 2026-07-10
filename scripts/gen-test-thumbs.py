"""Generate 2 test thumbnail PNGs for agent-browser upload test."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = "/home/z/my-project/download"
os.makedirs(OUT_DIR, exist_ok=True)

# Thumbnail 1: purple bg, big text "FAIL"
img1 = Image.new("RGB", (1280, 720), color=(124, 58, 237))
d1 = ImageDraw.Draw(img1)
try:
    font_big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 200)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
except Exception:
    font_big = ImageFont.load_default()
    font_small = ImageFont.load_default()
d1.text((100, 200), "FAIL", fill=(255, 255, 255), font=font_big)
d1.text((100, 500), "3 thumbnail mistakes", fill=(255, 255, 255, 200), font=font_small)
img1.save(os.path.join(OUT_DIR, "test-thumb-1.png"))

# Thumbnail 2: pink bg, big text "WIN"
img2 = Image.new("RGB", (1280, 720), color=(236, 72, 153))
d2 = ImageDraw.Draw(img2)
d2.text((100, 200), "WIN", fill=(255, 255, 255), font=font_big)
d2.text((100, 500), "thumbnail that converts", fill=(255, 255, 255, 200), font=font_small)
img2.save(os.path.join(OUT_DIR, "test-thumb-2.png"))

print("Generated: test-thumb-1.png, test-thumb-2.png")
