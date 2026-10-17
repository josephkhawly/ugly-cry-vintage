import type { Metadata } from 'next'
import Link from 'next/link'

import { CartContent } from '@/components/cart/CartLines'

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: 'Cart | Ugly Cry Vintage',
  description: 'Your shopping cart',
}

export default function CartPage() {
  return (
    <div className='container mx-auto max-w-3xl px-6 pt-16 pb-16 sm:pt-24'>
      <div className='mb-8 flex items-end justify-between gap-4'>
        <h1 className='font-frogmore text-espresso text-5xl tracking-wide md:text-6xl'>Cart</h1>
        <Link className='font-subheading text-sm tracking-wide uppercase underline' href='/shop'>
          Continue shopping
        </Link>
      </div>
      <CartContent variant='page' />
    </div>
  )
}
