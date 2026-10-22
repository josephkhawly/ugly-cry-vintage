'use client'

import type { CartLine } from '@shopify/hydrogen'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import { useCart, useCartForm, useSuspenseCart } from '@/lib/cart'
import { closeCartDrawer } from '@/lib/cart-drawer'
import { DEFAULT_OPTION } from '@/lib/constants'
import { formatPrice } from '@/lib/money'
import { resolveProductImage } from '@/lib/product-image'
import {
  reshapeColors,
  reshapeSizes,
  type ShopifyCategoryMetafield,
} from '@/lib/shopify/category-attributes'
import { createUrl } from '@/lib/utils'

type CartProductWithAttributes = NonNullable<CartLine['merchandise']>['product'] & {
  color?: ShopifyCategoryMetafield
  size?: ShopifyCategoryMetafield
}

function CartErrorBanner({ lines }: { lines: CartLine[] }) {
  const errors = useCart((state) => state.errors)
  const messages = [
    ...errors.network.map((error) => error.message),
    ...errors.cart.userErrors.map((error) => error.message),
    ...errors.cart.warnings.map((warning) => warning.message),
    ...Array.from(errors.lines.entries()).flatMap(([lineId, group]) =>
      lines.some((line) => line.id === lineId)
        ? []
        : [
            ...group.userErrors.map((error) => error.message),
            ...group.warnings.map((warning) => warning.message),
          ],
    ),
  ].filter(Boolean)

  if (messages.length === 0) return null

  return (
    <div
      className='border-espresso/30 bg-sandy-clay/40 text-espresso mb-3 rounded-md border px-3 py-2 text-sm'
      role='alert'
    >
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  )
}

function LineItem({ line }: { line: CartLine }) {
  const { formProps, register } = useCartForm()
  const pendingLines = useCart((state) => state.pending.lines)
  const lineErrors = useCart((state) => state.errors.lines)
  const isPending = pendingLines.has(line.id)
  const errorGroup = lineErrors.get(line.id)
  const errorMessages = errorGroup
    ? [
        ...errorGroup.userErrors.map((error) => error.message),
        ...errorGroup.warnings.map((warning) => warning.message),
      ]
    : []
  const errorId = `cart-line-error-${line.id}`
  const merchandise = line.merchandise
  const selectedOptions = merchandise?.selectedOptions ?? []
  const product = merchandise?.product as CartProductWithAttributes | undefined
  const title = product?.title ?? merchandise?.title ?? 'Product'
  const image = resolveProductImage(
    merchandise?.image?.url
      ? {
          altText: merchandise.image.altText ?? '',
          height: merchandise.image.height ?? 800,
          url: merchandise.image.url,
          width: merchandise.image.width ?? 600,
        }
      : null,
    [],
    title,
  )
  const colors = reshapeColors(product?.color)
  const sizes = reshapeSizes(product?.size)

  const merchandiseSearchParams: Record<string, string> = {}
  selectedOptions.forEach(({ name, value }) => {
    if (value !== DEFAULT_OPTION) {
      merchandiseSearchParams[name.toLowerCase()] = value
    }
  })

  const merchandiseUrl = product?.handle
    ? createUrl(`/product/${product.handle}`, new URLSearchParams(merchandiseSearchParams))
    : null
  const optionLabel = selectedOptions
    .filter((option) => option.value !== DEFAULT_OPTION)
    .map((option) => option.value)
    .join(' / ')

  return (
    <li className='flex w-full flex-col border-b border-neutral-300'>
      <div className='flex w-full flex-row justify-between gap-3 px-1 py-4'>
        <div className='flex min-w-0 flex-row'>
          <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300'>
            <Image
              alt={image.altText || title}
              className='h-full w-full object-cover'
              height={96}
              src={image.url}
              width={96}
            />
          </div>
          <div className='ml-2 flex min-w-0 flex-1 flex-col text-base'>
            {merchandiseUrl ? (
              <Link
                className='leading-tight hover:underline'
                href={merchandiseUrl}
                onClick={closeCartDrawer}
              >
                {title}
              </Link>
            ) : (
              <span className='leading-tight'>{title}</span>
            )}
            {optionLabel ? (
              <span className='text-espresso/70 mt-1 text-sm'>{optionLabel}</span>
            ) : null}
            {colors.length > 0 || sizes.length > 0 ? (
              <div className='text-espresso/70 mt-1 flex flex-col text-sm'>
                {colors.map((color) => (
                  <span key={color.label}>Color: {color.label}</span>
                ))}
                {sizes.map((size) => (
                  <span key={size}>Size: {size}</span>
                ))}
              </div>
            ) : null}
            <p className={`mt-2 text-sm ${isPending ? 'opacity-30' : ''}`}>
              {formatPrice(line.cost.totalAmount)}
            </p>
          </div>
        </div>

        <form
          {...formProps()}
          className={`flex shrink-0 flex-col items-end gap-2 ${isPending ? 'opacity-30' : ''}`}
        >
          <input type='hidden' {...register('lineId', { value: line.id })} />
          <button
            aria-describedby={errorMessages.length > 0 ? errorId : undefined}
            aria-label={`Remove ${title} from cart`}
            className='text-espresso text-sm underline'
            {...register('remove')}
          >
            Remove
          </button>
          {errorMessages.length > 0 ? (
            <p className='text-burnt-orange max-w-40 text-right text-xs' id={errorId} role='alert'>
              {errorMessages.join(' ')}
            </p>
          ) : null}
        </form>
      </div>
    </li>
  )
}

function CartTotals() {
  const cart = useSuspenseCart((state) => state.data)
  const totalsPending = useCart(
    (state) => state.pending.cost === true || state.revalidating === true,
  )
  const checkoutUrl = cart.checkoutUrl

  return (
    <div className='shrink-0 border-t border-black/20 pt-4'>
      <div className='mb-3 flex items-center justify-between pt-1 pb-1'>
        <p className='text-md text-espresso'>Subtotal</p>
        <p className={`text-right text-base text-black ${totalsPending ? 'opacity-30' : ''}`}>
          {formatPrice(cart.cost.subtotalAmount)}
        </p>
      </div>
      <p className='mt-0.5 text-sm text-espresso/90'>Shipping and taxes calculated at checkout.</p>
      {checkoutUrl ? (
        <a
          className='border-espresso bg-sandy-clay font-subheading text-espresso mt-4 flex w-full cursor-pointer items-center justify-center rounded-full border px-10 py-3.5 text-lg tracking-wide uppercase hover:opacity-90'
          href={checkoutUrl}
        >
          Proceed to Checkout
        </a>
      ) : null}
    </div>
  )
}

function CartLinesBody({ variant }: { variant: 'drawer' | 'page' }) {
  const lines = useSuspenseCart((state) => state.data.lines.nodes)
  const loading = useCart((state) => state.loading)

  if (loading) {
    return <p role='status'>Loading cart…</p>
  }

  if (lines.length === 0) {
    return (
      <div className='mt-12 flex w-full flex-col items-center justify-center overflow-hidden'>
        <CartErrorBanner lines={lines} />
        <p className='text-center text-2xl font-bold'>Your cart is empty.</p>
        {variant === 'page' ? (
          <Link className='font-subheading mt-4 text-sm uppercase underline' href='/shop'>
            Continue shopping
          </Link>
        ) : null}
      </div>
    )
  }

  return (
    <div className='flex h-full min-h-0 flex-col justify-between overflow-hidden'>
      <CartErrorBanner lines={lines} />
      <ul className='min-h-0 grow overflow-auto py-2'>
        {lines.map((line) => (
          <LineItem key={line.id} line={line} />
        ))}
      </ul>
      <CartTotals />
    </div>
  )
}

export function CartContent({ variant = 'drawer' }: { variant?: 'drawer' | 'page' }) {
  return (
    <Suspense
      fallback={
        <p className={variant === 'page' ? 'py-12 text-center' : ''} role='status'>
          Loading cart…
        </p>
      }
    >
      <CartLinesBody variant={variant} />
    </Suspense>
  )
}
