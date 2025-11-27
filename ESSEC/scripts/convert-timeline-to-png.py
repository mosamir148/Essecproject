#!/usr/bin/env python3
"""
Script to convert SVG timeline to high-resolution PNG
Requires: cairosvg or svglib+reportlab
Usage: python scripts/convert-timeline-to-png.py
"""

import os
import sys
from pathlib import Path

def convert_with_cairosvg():
    """Convert using cairosvg (recommended)"""
    try:
        import cairosvg
        
        script_dir = Path(__file__).parent
        svg_path = script_dir.parent / 'public' / 'timeline-s-wave-standalone.svg'
        output_path = script_dir.parent / 'public' / 'timeline-s-wave.png'
        
        # High resolution (2x scale)
        cairosvg.svg2png(
            url=str(svg_path),
            write_to=str(output_path),
            output_width=2400,
            output_height=4000,
            background_color='#FAFAFA'
        )
        
        print('✅ Successfully converted SVG to PNG using cairosvg!')
        print(f'📁 Output: {output_path}')
        print(f'📐 Resolution: 2400x4000px (2x scale)')
        
        # Standard resolution
        standard_output = script_dir.parent / 'public' / 'timeline-s-wave-standard.png'
        cairosvg.svg2png(
            url=str(svg_path),
            write_to=str(standard_output),
            output_width=1200,
            output_height=2000,
            background_color='#FAFAFA'
        )
        
        print(f'📁 Standard resolution: {standard_output}')
        print(f'📐 Resolution: 1200x2000px (1x scale)')
        
        return True
        
    except ImportError:
        return False
    except Exception as e:
        print(f'❌ Error with cairosvg: {e}')
        return False

def convert_with_svglib():
    """Convert using svglib+reportlab (alternative)"""
    try:
        from svglib.svglib import svg2rlg
        from reportlab.graphics import renderPM
        
        script_dir = Path(__file__).parent
        svg_path = script_dir.parent / 'public' / 'timeline-s-wave-standalone.svg'
        output_path = script_dir.parent / 'public' / 'timeline-s-wave.png'
        
        # Convert SVG to ReportLab drawing
        drawing = svg2rlg(str(svg_path))
        
        if drawing is None:
            print('❌ Failed to parse SVG file')
            return False
        
        # Scale for high resolution
        scale = 2.0
        drawing.width = drawing.width * scale
        drawing.height = drawing.height * scale
        drawing.scale(scale, scale)
        
        # Render to PNG
        renderPM.drawToFile(drawing, str(output_path), fmt='PNG', dpi=144)
        
        print('✅ Successfully converted SVG to PNG using svglib!')
        print(f'📁 Output: {output_path}')
        print(f'📐 Resolution: 2400x4000px (2x scale)')
        
        return True
        
    except ImportError:
        return False
    except Exception as e:
        print(f'❌ Error with svglib: {e}')
        return False

def main():
    print('🔄 Converting SVG timeline to PNG...\n')
    
    # Try cairosvg first (better quality)
    if convert_with_cairosvg():
        return
    
    # Fallback to svglib
    print('\n⚠️  cairosvg not available, trying svglib...\n')
    if convert_with_svglib():
        return
    
    # Neither method available
    print('\n❌ No conversion library found!')
    print('\n💡 Please install one of the following:')
    print('   pip install cairosvg  (recommended)')
    print('   OR')
    print('   pip install svglib reportlab')
    print('\nAlternatively, use an online converter or Inkscape:')
    print('   inkscape --export-filename=timeline-s-wave.png --export-width=2400 --export-height=4000 timeline-s-wave-standalone.svg')
    sys.exit(1)

if __name__ == '__main__':
    main()


