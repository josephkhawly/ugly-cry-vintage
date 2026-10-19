'use client'

import { openCartDrawer } from '@/lib/cart-drawer'
import { ProductProvider, toAddToCartProduct, useProductForm } from '@/lib/product'
import type { Product } from '@/lib/shopify/types'

interface ProductCardQuickAddProps {
  product: Product
}

function ProductCardQuickAddForm({ size }: { size?: string }) {
  const { formProps, register, selectedVariant } = useProductForm()

  if (!selectedVariant?.id) return null

  return (
    <div className='bg-teal/50 text-espresso absolute inset-x-0 bottom-0 z-10 flex h-12 translate-y-full items-center justify-between gap-3 px-3 text-sm backdrop-blur-sm transition-transform duration-300 ease-out group-hover:translate-y-0'>
      {size ? <span>Size {size}</span> : <span />}
      <form
        {...formProps({
          beforeSubmit: openCartDrawer,
        })}
      >
        <input type='hidden' {...register('merchandiseId', {})} />
        <input type='hidden' {...register('quantity', { value: 1 })} />
        <button
          aria-label='Quick add to cart'
          className='cursor-pointer underline'
          {...register('addToCart', {})}
        >
          Quick Add
        </button>
      </form>
    </div>
  )
}

export function ProductCardQuickAdd({ product }: ProductCardQuickAddProps) {
  const size = product.sizes[0]

  return (
    <ProductProvider product={toAddToCartProduct(product)}>
      <ProductCardQuickAddForm size={size} />
    </ProductProvider>
  )
}
