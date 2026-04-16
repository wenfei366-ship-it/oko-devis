'use client'

import Hero from '@/components/ui/animated-shader-hero'
import LoginFormCard from '@/app/components/LoginFormCard'

export default function LoginPage() {
  return (
    <Hero
      trustBadge={{
        text: 'OKO 内部销售协作系统',
        icons: ['◦'],
      }}
      headline={{
        line1: '登录',
        line2: '项目档案',
      }}
      subtitle="报价单、合同、发送跟进与共享记录，在同一处继续处理。"
      className="min-h-screen"
    >
      <div className="mx-auto w-full max-w-[1120px] px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_420px]">
          <div className="hidden lg:block text-left">
            <div className="text-[11px] font-bold uppercase tracking-[2.6px] text-[#D8C38A]">
              OKO · 项目档案 · 2026
            </div>
            <h1
              className="mt-5 text-[84px] font-bold leading-[0.92] tracking-[-2px] text-[#F8F1E0]"
              style={{ fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
            >
              登录
              <br />
              项目档案
            </h1>
            <p
              className="mt-6 max-w-[520px] text-[18px] leading-8 text-[#E7DCC1]"
              style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
            >
              继续处理报价单、合同与发送跟进。所有记录共享，但每一次创建、发送和修改都会保留是谁做的。
            </p>
          </div>

          <LoginFormCard />
        </div>
      </div>
    </Hero>
  )
}
