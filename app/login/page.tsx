'use client'

import Hero from '@/components/ui/animated-shader-hero'
import LoginFormCard from '@/app/components/LoginFormCard'

export default function LoginPage() {
  return (
    <Hero
      trustBadge={{
        text: 'OKO 内部销售系统',
        icons: ['✦'],
      }}
      headline={{
        line1: '进入 OKO',
        line2: '项目档案',
      }}
      subtitle="报价单、合同、发送跟进与共享历史，统一在同一套内部系统里协作处理。"
      className="min-h-screen"
    >
      <LoginFormCard />
    </Hero>
  )
}
