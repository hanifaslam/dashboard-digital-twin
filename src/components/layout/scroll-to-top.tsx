'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

gsap.registerPlugin(useGSAP)

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const containerRef = useRef<HTMLButtonElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
        setShouldRender(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const tl = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      if (!shouldRender || !containerRef.current) return

      gsap.set(containerRef.current, { opacity: 0, y: 20 })
      gsap.set(circleRef.current, { scale: 0.8 })
      gsap.set(arrowRef.current, { y: 10, opacity: 0 })
      gsap.set(textRef.current, { opacity: 0, y: 5 })

      tl.current = gsap.timeline({
        paused: true,
        onReverseComplete: () => setShouldRender(false)
      })

      tl.current
        .to(containerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'back.out(1.5)'
        })
        .to(
          circleRef.current,
          {
            scale: 1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)'
          },
          '-=0.2'
        )
        .to(
          arrowRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out'
          },
          '-=0.2'
        )
        .to(
          textRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.2,
            ease: 'power2.out'
          },
          '-=0.1'
        )
    },
    { dependencies: [shouldRender], scope: containerRef }
  )

  useEffect(() => {
    if (tl.current) {
      if (isVisible) {
        tl.current.play()
      } else {
        tl.current.reverse()
      }
    }
  }, [isVisible])

  const handleMouseEnter = () => {
    if (!arrowRef.current || !isVisible) return

    gsap.to(arrowRef.current, {
      y: -3,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      overwrite: true
    })
  }

  const handleMouseLeave = () => {
    if (!arrowRef.current || !isVisible) return

    gsap.to(arrowRef.current, {
      y: 0,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: true
    })
  }

  const scrollToTop = () => {
    if (!arrowRef.current || !circleRef.current) return

    gsap.to(arrowRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(arrowRef.current, { y: 30 })
        gsap.to(arrowRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        })
      }
    })

    gsap.to(circleRef.current, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.in',
      yoyo: true,
      repeat: 1
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!shouldRender) return null

  return (
    <button
      ref={containerRef}
      onClick={scrollToTop}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-2"
      aria-label="Scroll to top"
    >
      <div
        ref={circleRef}
        className="flex items-center justify-center h-14 w-14 rounded-full bg-white shadow-lg border border-gray-100"
        style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
      >
        <div ref={arrowRef}>
          <ArrowUp className="h-6 w-6 text-gray-600" strokeWidth={2} />
        </div>
      </div>
      <span
        ref={textRef}
        className="text-xs font-medium text-primary-foreground whitespace-nowrap"
      >
        Scroll To Top
      </span>
    </button>
  )
}
