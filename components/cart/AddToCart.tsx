'use client'

import { canAddToCart } from '@shopify/hydrogen'
import { ShopPayButton } from '@shopify/hydrogen/react'
import clsx from 'clsx'

import { openCartDrawer } from '@/lib/cart-drawer'
import {
  type AddToCartProduct,
  ProductProvider,
  toAddToCartProduct,
  useProductForm,
} from '@/lib/product'
import type { Product } from '@/lib/shopify/types'

function AddToCartForm({ product }: { product: AddToCartProduct }) {
  const { formProps, options, pending, register, selectedVariant } = useProductForm()
  const addable = canAddToCart(product, options)
  const selectedVariantId = selectedVariant?.id
  const buttonClasses =
    'relative flex w-full items-center justify-center rounded-md bg-sandy-clay p-2 text-lg tracking-wide text-espresso border border-espresso uppercase'
  const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60'
  const label = addable
    ? 'Add To Cart'
    : selectedVariant === null
      ? 'Select Options'
      : 'Out Of Stock'

  return (
    <div className='mx-auto flex w-full flex-col gap-3 lg:w-1/2'>
      <form
        {...formProps({
          beforeSubmit: (event) => {
            if (!addable) {
              event.preventDefault()
              return
            }
            openCartDrawer()
          },
        })}
      >
        <input type='hidden' {...register('merchandiseId', {})} />
        <input type='hidden' {...register('quantity', { value: 1 })} />
        <button
          aria-label={label}
          className={clsx(
            buttonClasses,
            addable && !pending ? 'cursor-pointer hover:opacity-90' : disabledClasses,
          )}
          {...register('addToCart', {})}
          disabled={!addable || pending}
        >
          {label}
        </button>
      </form>
      {selectedVariantId ? (
        <ShopPayButton
          borderRadius='6px'
          disabled={!addable || pending}
          variants={[{ id: selectedVariantId, quantity: 1 }]}
          width='100%'
        />
      ) : null}
    </div>
  )
}

export function AddToCart({ product }: { product: Product }) {
  const addToCartProduct = toAddToCartProduct(product)

  return (
    <ProductProvider product={addToCartProduct}>
      <AddToCartForm product={addToCartProduct} />
    </ProductProvider>
  )
}
