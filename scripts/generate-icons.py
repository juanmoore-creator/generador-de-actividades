import base64
import os
from PIL import Image, ImageDraw

def generate_icons():
    src_path = os.path.join("public", "logo.jpg")
    icons_dir = os.path.join("public", "icons")
    os.makedirs(icons_dir, exist_ok=True)

    src = Image.open(src_path).convert("RGBA")

    # 1. Base squircle crop (173, 173, 851, 851)
    squircle_box = (173, 173, 851, 851)
    squircle = src.crop(squircle_box)
    sw, sh = squircle.size

    # Super-sampled anti-aliased mask
    scale_factor = 4
    mask_large = Image.new("L", (sw * scale_factor, sh * scale_factor), 0)
    draw = ImageDraw.Draw(mask_large)
    radius = int(sw * 0.22 * scale_factor)
    draw.rounded_rectangle((0, 0, sw * scale_factor, sh * scale_factor), radius=radius, fill=255)
    mask = mask_large.resize((sw, sh), Image.Resampling.LANCZOS)

    # Squircle with transparent background
    icon_squircle = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    icon_squircle.paste(squircle, (0, 0), mask=mask)

    # Save 512x512
    p512 = os.path.join(icons_dir, "icon-512.png")
    icon_512 = icon_squircle.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save(p512, optimize=True)

    # Save 192x192
    p192 = os.path.join(icons_dir, "icon-192.png")
    icon_192 = icon_squircle.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(p192, optimize=True)

    # 2. Maskable icon: Edge-to-edge gradient background with artwork inside 80% safe zone
    maskable_512 = Image.new("RGBA", (512, 512), (0, 0, 0, 255))
    m_draw = ImageDraw.Draw(maskable_512)
    for y in range(512):
        t = y / 511.0
        r = int(38 * (1.0 - t) + 17 * t)
        g = int(51 * (1.0 - t) + 28 * t)
        b = int(70 * (1.0 - t) + 48 * t)
        m_draw.line([(0, y), (512, y)], fill=(r, g, b, 255))

    scaled_size = int(512 * 0.78)
    scaled_artwork = icon_squircle.resize((scaled_size, scaled_size), Image.Resampling.LANCZOS)
    offset = ((512 - scaled_size) // 2, (512 - scaled_size) // 2)
    maskable_512.paste(scaled_artwork, offset, mask=scaled_artwork)
    p_maskable = os.path.join(icons_dir, "icon-maskable-512.png")
    maskable_512.convert("RGB").save(p_maskable, optimize=True)

    # 3. Apple Touch Icon (180x180) - Opaque RGB
    apple_180 = Image.new("RGB", (180, 180), (0, 0, 0))
    a_draw = ImageDraw.Draw(apple_180)
    for y in range(180):
        t = y / 179.0
        r = int(38 * (1.0 - t) + 17 * t)
        g = int(51 * (1.0 - t) + 28 * t)
        b = int(70 * (1.0 - t) + 48 * t)
        a_draw.line([(0, y), (180, y)], fill=(r, g, b))

    apple_scaled = int(180 * 0.82)
    apple_artwork = icon_squircle.resize((apple_scaled, apple_scaled), Image.Resampling.LANCZOS)
    apple_offset = ((180 - apple_scaled) // 2, (180 - apple_scaled) // 2)
    apple_180.paste(apple_artwork, apple_offset, mask=apple_artwork)
    p_apple = os.path.join(icons_dir, "apple-touch-icon.png")
    apple_180.save(p_apple, optimize=True)

    # 4. Embedded SVGs for web/browser fallbacks
    with open(p192, "rb") as f:
        b64_192 = base64.b64encode(f.read()).decode("utf-8")
    svg_192_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <image href="data:image/png;base64,{b64_192}" width="192" height="192" />
</svg>
'''
    with open(os.path.join(icons_dir, "icon-192.svg"), "w", encoding="utf-8") as f:
        f.write(svg_192_content)

    with open(p512, "rb") as f:
        b64_512 = base64.b64encode(f.read()).decode("utf-8")
    svg_512_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,{b64_512}" width="512" height="512" />
</svg>
'''
    with open(os.path.join(icons_dir, "icon-512.svg"), "w", encoding="utf-8") as f:
        f.write(svg_512_content)

    print("All icons successfully generated and updated!")

if __name__ == "__main__":
    generate_icons()
