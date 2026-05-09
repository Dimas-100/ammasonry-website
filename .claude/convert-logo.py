"""Render am-logo.pdf to a tightly-cropped PNG for use in the nav bar."""
import fitz  # PyMuPDF
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "am-logo.pdf"
OUT_DIR = ROOT / "img"
OUT_DIR.mkdir(exist_ok=True)
OUT = OUT_DIR / "am-logo.png"

doc = fitz.open(PDF)
page = doc[0]

# Render at 4x resolution for sharp display on retina
zoom = 4.0
mat = fitz.Matrix(zoom, zoom)
pix = page.get_pixmap(matrix=mat, alpha=True)

# Find bounding box of non-white pixels so we crop the logo out of the
# big white PDF page. We use the alpha channel + per-pixel scan via samples.
import numpy as np
arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)

# With alpha=True, the background is transparent (alpha=0). Detect ink as
# either visible (alpha>0) AND not white-ish. We require both because some
# PDFs include invisible text frames that paint the page rectangle.
if pix.n == 4:
    alpha = arr[:, :, 3]
    rgb = arr[:, :, :3].astype(np.int16)
    not_white = (rgb < 240).any(axis=2)
    ink_mask = (alpha > 30) & not_white
else:
    rgb = arr[:, :, :3].astype(np.int16)
    ink_mask = (rgb < 240).any(axis=2)

ys, xs = np.where(ink_mask)
if len(xs) == 0:
    raise SystemExit("No content found in PDF")

pad = 20
x0, y0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
x1, y1 = min(pix.width, xs.max() + pad), min(pix.height, ys.max() + pad)

# Clip and re-render at the cropped bbox in the PDF's coordinate space
page_rect = page.rect
scale_x = page_rect.width / pix.width
scale_y = page_rect.height / pix.height
clip = fitz.Rect(x0 * scale_x, y0 * scale_y, x1 * scale_x, y1 * scale_y)

pix2 = page.get_pixmap(matrix=mat, alpha=True, clip=clip)
pix2.save(OUT)
print(f"Wrote {OUT} ({pix2.width}x{pix2.height})")
