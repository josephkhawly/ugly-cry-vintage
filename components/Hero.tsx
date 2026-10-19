import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'

interface HeroProps {
  backgroundImage: StaticImageData | string
  backgroundImageAlt: string
  href?: string
  objectFit?: 'contain' | 'cover'
  overlayOpacity?: number
}

export function Hero({
  backgroundImage,
  backgroundImageAlt,
  href,
  objectFit = 'cover',
  overlayOpacity = 0.4,
}: HeroProps) {
  const className = `relative -mt-31 block h-svh overflow-hidden md:-mt-64${href ? ' cursor-pointer' : ''}`

  const content = (
    <>
      <Image
        alt={backgroundImageAlt}
        className='data-[object-fit=contain]:object-contain data-[object-fit=cover]:object-cover'
        data-object-fit={objectFit}
        fill
        priority
        sizes='100vw'
        src={backgroundImage}
      />
      {overlayOpacity > 0 ? (
        <div className='bg-espresso absolute inset-0' style={{ opacity: overlayOpacity }} />
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link className={className} href={href}>
        {content}
      </Link>
    )
  }

  return <section className={className}>{content}</section>
}
