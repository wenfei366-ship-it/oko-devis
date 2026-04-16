'use client'

import Hero from '@/components/ui/animated-shader-hero'
import LoginFormCard from '@/app/components/LoginFormCard'

export default function LoginPage() {
  return (
    <Hero
      headline={{ line1: '', line2: '' }}
      subtitle=""
      className="min-h-screen"
      hideDefaultContent
    >
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-10 gap-8">
        <div className="relative z-10 w-[420px] max-w-full">
          <LoginFormCard />
        </div>
        <div
          className="relative z-10 text-center text-[9px] font-medium tracking-[1.5px]"
          style={{ color: '#C8B987' }}
        >
          OKO · 31 boulevard de Magenta, 75010 Paris · joinoko.com
        </div>
      </div>
    </Hero>
  )
}
