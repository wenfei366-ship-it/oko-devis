import { Font } from '@react-pdf/renderer'

let registered = false

function fontPath(file: string) {
  if (typeof window === 'undefined') {
    return `${process.cwd()}/public/fonts/${file}`
  }

  return `/fonts/${file}`
}

export function registerPdfFonts() {
  if (registered) return
  registered = true

  Font.register({
    family: 'Playfair Display',
    fonts: [
      { src: fontPath('PlayfairDisplay.ttf'), fontWeight: 700 },
      { src: fontPath('PlayfairDisplay-Italic.ttf'), fontWeight: 700, fontStyle: 'italic' },
    ],
  })

  Font.register({
    family: 'Inter',
    fonts: [
      { src: fontPath('Inter.ttf'), fontWeight: 400 },
      { src: fontPath('Inter.ttf'), fontWeight: 500 },
      { src: fontPath('Inter.ttf'), fontWeight: 600 },
      { src: fontPath('Inter.ttf'), fontWeight: 700 },
      { src: fontPath('Inter-Italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
    ],
  })

  Font.register({
    family: 'Noto Sans SC',
    fonts: [
      { src: fontPath('NotoSansSC.ttf'), fontWeight: 400 },
      { src: fontPath('NotoSansSC.ttf'), fontWeight: 500 },
      { src: fontPath('NotoSansSC.ttf'), fontWeight: 700 },
    ],
  })

  // Disable hyphenation (French text shouldn't auto-hyphenate)
  Font.registerHyphenationCallback((word) => [word])
}
