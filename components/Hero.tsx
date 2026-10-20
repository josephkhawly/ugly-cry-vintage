import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'

interface HeroProps {
  backgroundImage: StaticImageData | string
  backgroundImageAlt: string
  cta?: {
    href: string
    label: string
  }
  heading?: string
  href?: string
  objectFit?: 'contain' | 'cover'
  overlayOpacity?: number
  supportingText?: string
}

export function Hero({
  backgroundImage,
  backgroundImageAlt,
  cta,
  heading,
  href,
  objectFit = 'cover',
  overlayOpacity = 0.4,
  supportingText,
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
      <div className='relative flex h-full flex-col items-center justify-center px-6 text-center md:px-12'>
        {heading ? (
          <h1 className='font-frogmore max-w-4xl text-5xl tracking-wide text-white md:text-7xl'>
            {heading}
          </h1>
        ) : null}
        {supportingText ? (
          <p className='font-body mt-4 max-w-xl text-lg text-white/90 md:text-xl'>
            {supportingText}
          </p>
        ) : null}
        {cta ? (
          href ? (
            <span className='bg-silver text-espresso mt-5 rounded-md px-6 py-3 tracking-wide'>
              {cta.label}
            </span>
          ) : (
            <Link
              className='bg-silver text-espresso mt-5 cursor-pointer rounded-md px-6 py-3 tracking-wide hover:opacity-90'
              href={cta.href}
            >
              {cta.label}
            </Link>
          )
        ) : null}
      </div>
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
