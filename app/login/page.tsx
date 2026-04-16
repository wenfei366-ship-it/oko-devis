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
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-[#F8F1E0]/18" />
        <div className="absolute inset-0 opacity-[0.15] mix-blend-screen" style={{ backgroundColor: '#EDE2C2' }} />
        <div
          className="absolute bottom-8 left-1/2 text-center text-[9px] font-medium tracking-[1.5px]"
          style={{ color: '#C8B987', transform: 'translateX(-50%)' }}
        >
          OKO · 31 boulevard de Magenta, 75010 Paris · joinoko.com
        </div>
        <div className="relative z-10 h-[520px] w-[420px] max-w-full">
          <div
            aria-hidden
            className="absolute left-1 top-1 h-[520px] w-[420px] rounded-[14px]"
            style={{ backgroundColor: '#1C1611', opacity: 0.08 }}
          />
          <div className="relative">
            <LoginFormCard />
          </div>
        </div>
      </div>
    </Hero>
  )
}
