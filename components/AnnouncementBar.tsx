'use client'

import { useSyncExternalStore } from 'react'
import Marquee from 'react-fast-marquee'

const ANNOUNCEMENT_TEXT = 'Relik Vintage Fest Feb 27, 2027 Ridgefield, WA'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

export function AnnouncementBar() {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => true,
  )

  return (
    <div aria-label='Announcement' className='bg-espresso w-full text-white' role='region'>
      {reduceMotion ? (
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
