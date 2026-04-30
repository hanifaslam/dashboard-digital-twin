'use client'

import { AuthModal } from '@/components/common/modal/auth-modal'
import { ResetPasswordHandler } from '@/components/common/modal/reset-password-handler'
import { usePathname } from 'next/navigation'
import { Header } from './header'
import { MobileNav, MobileNavProvider } from './mobile-nav'
import { ScrollToTop } from './scroll-to-top'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <MobileNavProvider>
      <div
        className="relative flex min-h-screen w-full flex-col"
        suppressHydrationWarning
      >
        <Header />
        <main className="flex-1">{children}</main>
        <MobileNav />
        {isHome && <ScrollToTop />}
        <AuthModal />
        <ResetPasswordHandler />
      </div>
    </MobileNavProvider>
  )
}
