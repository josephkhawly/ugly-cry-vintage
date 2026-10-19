'use client'

import { ShopPayButton } from '@shopify/hydrogen/react'
import clsx from 'clsx'

import { useCart, useCartForm } from '@/lib/cart'
import { openCartDrawer } from '@/lib/cart-drawer'
import type { Product } from '@/lib/shopify/types'

function SubmitButton({
  availableForSale,
  selectedVariantId,
  register,
}: {
  availableForSale: boolean
  selectedVariantId: string | undefined
  register: ReturnType<typeof useCartForm>['register']
}) {
  const buttonClasses =
    'relative flex w-full cursor-pointer items-center justify-center rounded-md bg-sandy-clay p-2 text-lg tracking-wide text-espresso border border-espresso uppercase'
  const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60'

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)} type='button'>
        Out Of Stock
      </button>
    )
  }

  if (!selectedVariantId) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)} type='button'>
        Add To Cart
      </button>
    )
  }

  return (
    <button
      aria-label='Add to cart'
      className={clsx(buttonClasses, 'hover:opacity-90')}
      type='submit'
      {...register('add')}
    >
      Add To Cart
    </button>
  )
}

export function AddToCart({ product }: { product: Product }) {
  const variant = product.variants[0]
  const { formProps, register } = useCartForm()
  const cartPending = useCart(
    (cartState) => cartState.pending.lines.size > 0 || cartState.pending.cost === true,
  )
  const selectedVariantId = variant?.id

  return (
    <div className='mx-auto flex w-full flex-col gap-3 lg:w-1/2'>
      <form
        {...formProps({
          beforeSubmit: (event) => {
            if (!selectedVariantId) {
              event.preventDefault()
              return
            }
            openCartDrawer()
          },
        })}
      >
        <input type='hidden' {...register('merchandiseId', { value: selectedVariantId ?? '' })} />
        <input type='hidden' {...register('quantity', { value: 1 })} />
        <SubmitButton
          availableForSale={variant?.availableForSale ?? false}
          register={register}
          selectedVariantId={selectedVariantId}
        />
      </form>
      {selectedVariantId ? (
        <ShopPayButton
          borderRadius='6px'
          disabled={!variant.availableForSale || cartPending}
          variants={[{ id: selectedVariantId, quantity: 1 }]}
          width='100%'
        />
      ) : null}
    </div>
  )
}
