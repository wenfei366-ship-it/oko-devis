import { Font } from '@react-pdf/renderer'

let registered = false

export function registerPdfFonts() {
  if (registered) return
  registered = true

  Font.register({
    family: 'Playfair Display',
    fonts: [
      { src: '/fonts/PlayfairDisplay.ttf', fontWeight: 700 },
      { src: '/fonts/PlayfairDisplay-Italic.ttf', fontWeight: 700, fontStyle: 'italic' },
    ],
  })

  Font.register({
    family: 'Inter',
    fonts: [
      { src: '/fonts/Inter.ttf', fontWeight: 400 },
      { src: '/fonts/Inter.ttf', fontWeight: 500 },
      { src: '/fonts/Inter.ttf', fontWeight: 600 },
      { src: '/fonts/Inter.ttf', fontWeight: 700 },
      { src: '/fonts/Inter-Italic.ttf', fontWeight: 400, fontStyle: 'italic' },
    ],
  })

  // Disable hyphenation (French text shouldn't auto-hyphenate)
  Font.registerHyphenationCallback((word) => [word])
}
