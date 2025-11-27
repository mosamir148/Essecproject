# Timeline S-Wave Assets

This directory contains modern vertical timeline assets with an S-shaped wave design.

## Files

- **`timeline-s-wave-standalone.svg`** - Standalone SVG with gradient placeholders (no external image dependencies)
- **`timeline-s-wave-with-images.svg`** - SVG that references timeline images from `/timeline/` directory
- **`timeline-s-wave.png`** - High-resolution PNG (2400x4000px, 2x scale)
- **`timeline-s-wave-standard.png`** - Standard resolution PNG (1200x2000px, 1x scale)

## Design Features

✅ **S-shaped wave path** - Smooth S curve connecting all timeline points  
✅ **Alternating layout** - Points alternate above and below the wave  
✅ **Circular images** - Each point features a circular image with subtle shadow  
✅ **Text alignment** - Text positioned on opposite side from images  
✅ **Soft colors** - Contemporary color palette (#A8DADC, #457B9D, #1D3557)  
✅ **Italic headings** - Step titles use italic font style  
✅ **Minimal aesthetic** - Clean, balanced spacing and design  

## Converting SVG to PNG

### Option 1: Using Node.js (Sharp)

```bash
npm install sharp
node scripts/convert-timeline-to-png.js
```

### Option 2: Using Python (CairoSVG - Recommended)

```bash
pip install cairosvg
python scripts/convert-timeline-to-png.py
```

### Option 3: Using Inkscape (Command Line)

```bash
inkscape --export-filename=timeline-s-wave.png \
         --export-width=2400 \
         --export-height=4000 \
         timeline-s-wave-standalone.svg
```

### Option 4: Online Converter

Upload the SVG to an online converter like:
- https://cloudconvert.com/svg-to-png
- https://convertio.co/svg-png/

Set resolution to 2400x4000px for high-res output.

## Customization

### Changing Colors

Edit the gradient definitions in the SVG:
- `waveGradient` - Main wave path color
- `imageGrad1-4` - Image placeholder gradients
- Text colors are defined inline in the `<text>` elements

### Changing Text

Edit the text content in each timeline point section:
- Point 1: Lines with "Step One" and description
- Point 2: Lines with "Step Two" and description
- Point 3: Lines with "Step Three" and description
- Point 4: Lines with "Step Four" and description

### Adding Images

In `timeline-s-wave-with-images.svg`, the images are referenced via:
```xml
<image href="/timeline/step1.jpg" ... />
```

Replace with your image paths or embed images as base64 data URIs.

## Usage in Web Projects

### As SVG (Scalable)

```html
<img src="/timeline-s-wave-standalone.svg" alt="Timeline" />
```

Or inline:
```html
<svg>...</svg>
```

### As PNG (Fixed Resolution)

```html
<img src="/timeline-s-wave.png" 
     srcset="/timeline-s-wave-standard.png 1x, /timeline-s-wave.png 2x"
     alt="Timeline" />
```

## Dimensions

- **SVG ViewBox**: 1200 × 2000
- **High-res PNG**: 2400 × 4000 (2x scale for retina displays)
- **Standard PNG**: 1200 × 2000 (1x scale)

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ SVG filters and gradients supported
- ✅ Responsive scaling


