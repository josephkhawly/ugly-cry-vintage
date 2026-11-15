import Image from 'next/image'
import Link from 'next/link'

interface HeroProps {
  backgroundImage: string
  backgroundImageAlt: string
  href: string
}

export function Hero({ backgroundImage, backgroundImageAlt, href }: HeroProps) {
  return (
    <Link
      className='relative -mt-31 block h-svh cursor-pointer overflow-hidden md:-mt-64'
      href={href}
    >
      <Image
        alt={backgroundImageAlt}
        className='object-contain'
        fill
        priority
        sizes='100vw'
        src={backgroundImage}
      />
    </Link>
  )
}
