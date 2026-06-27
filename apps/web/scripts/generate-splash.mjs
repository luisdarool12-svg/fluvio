/**
 * Genera splash screens para iPad en los tamaños requeridos por iOS/iPadOS.
 * Uso: node scripts/generate-splash.mjs
 */
import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../public/splash')
mkdirSync(OUT_DIR, { recursive: true })

// Colores de marca Fluvio
const BG = { r: 24, g: 15, b: 46 }   // #180F2E — plum
const VIOLET = '#6447F5'

// Tamaños de iPad requeridos por iPadOS (portrait)
const SCREENS = [
  { name: 'ipad-mini-6',        w: 1488, h: 2266 }, // iPad mini 6th gen
  { name: 'ipad-9',             w: 1620, h: 2160 }, // iPad 9th gen (10.2")
  { name: 'ipad-10-air5-pro11', w: 1640, h: 2360 }, // iPad 10th / Air 5th / Pro 11" M4
  { name: 'ipad-air4-pro11-1-3',w: 1668, h: 2388 }, // iPad Air 4th / Pro 11" 1-3rd
  { name: 'ipad-pro-12-9',      w: 2048, h: 2732 }, // iPad Pro 12.9"
]

function svgOverlay(w, h) {
  const fontSize = Math.round(w * 0.072)
  const taglineSize = Math.round(w * 0.024)
  const cx = w / 2
  const cy = h / 2

  return Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="${cx}" y="${cy - fontSize * 0.2}"
        font-family="Helvetica Neue, Arial, sans-serif"
        font-weight="800"
        font-size="${fontSize}"
        fill="${VIOLET}"
        text-anchor="middle"
        dominant-baseline="middle"
        letter-spacing="${Math.round(fontSize * 0.12)}"
      >FLUVIO</text>
      <text
        x="${cx}" y="${cy + fontSize * 0.95}"
        font-family="Helvetica Neue, Arial, sans-serif"
        font-weight="400"
        font-size="${taglineSize}"
        fill="rgba(255,255,255,0.4)"
        text-anchor="middle"
        dominant-baseline="middle"
        letter-spacing="${Math.round(taglineSize * 0.06)}"
      >Todo fluye.</text>
    </svg>
  `)
}

for (const { name, w, h } of SCREENS) {
  const outPath = join(OUT_DIR, `${name}.png`)

  await sharp({
    create: { width: w, height: h, channels: 3, background: BG },
  })
    .composite([{ input: svgOverlay(w, h), blend: 'over' }])
    .png({ compressionLevel: 9 })
    .toFile(outPath)

  const kb = Math.round((await import('fs')).statSync(outPath).size / 1024)
  console.log(`✓ ${name}.png  ${w}×${h}  (${kb} KB)`)
}

console.log('\nSplash screens generados en public/splash/')
