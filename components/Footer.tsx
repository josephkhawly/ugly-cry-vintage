import Link from 'next/link'
import { BsSubstack } from 'react-icons/bs'
import { FaInstagram } from 'react-icons/fa'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { getMenu } from '@/lib/shopify'

export default async function Footer() {
  const menu = await getMenu('footer')
  const year = new Date().getFullYear()

  return (
    <footer className='container mx-auto flex flex-col gap-6 p-6 lg:flex-row lg:items-stretch lg:justify-between lg:p-12'>
      <div className='contents lg:flex lg:flex-col lg:justify-between lg:gap-6'>
        <div className='order-1 flex flex-col items-start gap-3 lg:order-none lg:flex-row lg:items-center lg:gap-5'>
          {menu.map((item) =>
            /^https?:\/\//i.test(item.path) ? (
              <a className='font-subheading text-lg hover:underline' href={item.path} key={item.title}>
                {item.title}
              </a>
            ) : (
              <Link className='font-subheading text-lg hover:underline' href={item.path} key={item.title}>
                {item.title}
              </Link>
            ),
          )}
          <div className='flex items-center gap-5'>
            <a
              aria-label='Instagram'
              href='https://www.instagram.com/uglycryvintage'
              rel='noopener noreferrer'
              target='_blank'
            >
              <FaInstagram className='text-espresso text-3xl' />
            </a>
            <a
              aria-label='Substack'
              href='https://uglycryvintage.substack.com/'
              rel='noopener noreferrer'
              target='_blank'
            >
              <BsSubstack className='text-espresso size-6 text-3xl' />
            </a>
          </div>
        </div>
        <p className='font-body text-espresso/60 order-3 text-xs lg:order-none'>
          © {year} Ugly Cry Vintage
        </p>
      </div>
      <div className='order-2 flex flex-col gap-2 lg:order-none'>
        <h2 className='font-frogmore text-espresso text-5xl tracking-wide'>Join the list</h2>
        <p className='font-body text-espresso/80 max-w-xs text-sm'>
          New drops, shop updates, and stories from the rack.
        </p>
        <NewsletterForm variant='footer' />
      </div>
    </footer>
  )
}
