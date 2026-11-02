'use client'

import { useEffect, useState } from 'react'
import Marquee from 'react-fast-marquee'

const ANNOUNCEMENT_TEXT = 'Relik Vintage Fest Feb 27, 2027 Ridgefield, WA'

export function AnnouncementBar() {
  const [mounted, setMounted] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    setMounted(true)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    function sync() {
      setReduceMotion(media.matches)
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return (
    <div aria-label='Announcement' className='bg-espresso w-full text-white' role='region'>
      {!mounted || reduceMotion ? (
        <p className='font-subheading px-4 py-2 text-center text-xs tracking-wide uppercase md:text-sm'>
          {ANNOUNCEMENT_TEXT}
        </p>
      ) : (
        <Marquee autoFill pauseOnHover speed={35}>
          <span className='font-subheading mx-8 inline-block py-2 text-xs tracking-wide uppercase md:text-sm'>
            {ANNOUNCEMENT_TEXT}
          </span>
        </Marquee>
      )}
    </div>
  )
}
