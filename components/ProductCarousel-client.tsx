'use client'

import type * as React from 'react'
import { useRef } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'

import { PageContainer } from '@/components/PageContainer'

interface ProductCarouselClientProps {
  children: React.ReactNode
  heading: string
}

export function ProductCarouselClient({ children, heading }: ProductCarouselClientProps) {
  const scrollerRef = useRef<HTMLUListElement>(null)

  function scroll(direction: -1 | 1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ behavior: 'smooth', left: direction * el.clientWidth * 0.75 })
  }

  return (
    <section className='py-12 md:py-16'>
      <PageContainer>
        <div className='mb-6 flex items-center justify-between gap-4 md:mb-8'>
          <h2 className='font-frogmore text-espresso text-3xl tracking-wide capitalize md:text-5xl'>
            {heading}
          </h2>
          <div className='flex shrink-0 gap-2'>
            <button
              aria-label='Scroll products left'
              className='text-espresso flex size-11 cursor-pointer items-center justify-center'
              onClick={() => scroll(-1)}
              type='button'
            >
              <HiChevronLeft className='size-5' />
            </button>
            <button
              aria-label='Scroll products right'
              className='text-espresso flex size-11 cursor-pointer items-center justify-center'
              onClick={() => scroll(1)}
              type='button'
            >
              <HiChevronRight className='size-5' />
            </button>
          </div>
        </div>
        <ul
          className='flex snap-x snap-mandatory scrollbar-none gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] md:gap-6 [&_li]:w-44 [&_li]:shrink-0 [&_li]:snap-start md:[&_li]:w-56 [&::-webkit-scrollbar]:hidden'
          ref={scrollerRef}
        >
          {children}
        </ul>
      </PageContainer>
    </section>
  )
}
