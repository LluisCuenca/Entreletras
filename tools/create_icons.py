"""Render the typographic app icon. Requires Pillow; only used when maintaining assets."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
font_path = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
for size in (192, 512):
    scale = 3
    image = Image.new('RGB', (size * scale, size * scale), '#f5f4ee')
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(font_path, int(size * scale * .66))
    text = 'e.'
    box = draw.textbbox((0, 0), text, font=font)
    x = (size * scale - (box[2] - box[0])) / 2 - box[0]
    y = (size * scale - (box[3] - box[1])) / 2 - box[1]
    draw.text((x, y), text, font=font, fill='#183735')
    image.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icon-{size}.png')
