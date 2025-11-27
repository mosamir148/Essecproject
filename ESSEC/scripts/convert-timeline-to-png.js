/**
 * Script to convert SVG timeline to high-resolution PNG
 * Requires: sharp (npm install sharp)
 * Usage: node scripts/convert-timeline-to-png.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  const svgPath = path.join(__dirname, '../public/timeline-s-wave-standalone.svg');
  const outputPath = path.join(__dirname, '../public/timeline-s-wave.png');
  
  try {
    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Convert to PNG at high resolution (2x for retina)
    // Original SVG is 1200x2000, so we'll create 2400x4000 PNG
    await sharp(svgBuffer)
      .resize(2400, 4000, {
        fit: 'contain',
        background: { r: 250, g: 250, b: 250, alpha: 1 }
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    
    console.log('✅ Successfully converted SVG to PNG!');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📐 Resolution: 2400x4000px (2x scale)`);
    
    // Also create a standard resolution version
    const standardOutputPath = path.join(__dirname, '../public/timeline-s-wave-standard.png');
    await sharp(svgBuffer)
      .resize(1200, 2000, {
        fit: 'contain',
        background: { r: 250, g: 250, b: 250, alpha: 1 }
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(standardOutputPath);
    
    console.log(`📁 Standard resolution: ${standardOutputPath}`);
    console.log(`📐 Resolution: 1200x2000px (1x scale)`);
    
  } catch (error) {
    console.error('❌ Error converting SVG to PNG:', error.message);
    
    if (error.message.includes('sharp')) {
      console.log('\n💡 Tip: Install sharp by running: npm install sharp');
    }
    
    process.exit(1);
  }
}

// Alternative method using puppeteer if sharp doesn't work
async function convertSvgToPngPuppeteer() {
  const puppeteer = require('puppeteer');
  const svgPath = path.join(__dirname, '../public/timeline-s-wave-standalone.svg');
  const outputPath = path.join(__dirname, '../public/timeline-s-wave.png');
  
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Read SVG content
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Set viewport to high resolution
    await page.setViewport({ width: 2400, height: 4000 });
    
    // Create HTML with SVG
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #FAFAFA;
            }
            svg {
              display: block;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `;
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Take screenshot
    await page.screenshot({
      path: outputPath,
      width: 2400,
      height: 4000,
      fullPage: true
    });
    
    await browser.close();
    
    console.log('✅ Successfully converted SVG to PNG using Puppeteer!');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📐 Resolution: 2400x4000px (2x scale)`);
    
  } catch (error) {
    console.error('❌ Error converting SVG to PNG:', error.message);
    
    if (error.message.includes('puppeteer')) {
      console.log('\n💡 Tip: Install puppeteer by running: npm install puppeteer');
    }
    
    process.exit(1);
  }
}

// Try sharp first, fallback to puppeteer
async function main() {
  try {
    await convertSvgToPng();
  } catch (error) {
    console.log('\n⚠️  Sharp method failed, trying Puppeteer...\n');
    try {
      await convertSvgToPngPuppeteer();
    } catch (puppeteerError) {
      console.error('❌ Both conversion methods failed.');
      console.error('Please install either "sharp" or "puppeteer":');
      console.error('  npm install sharp');
      console.error('  OR');
      console.error('  npm install puppeteer');
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { convertSvgToPng, convertSvgToPngPuppeteer };


