import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { AddToCart } from '@/components/cart/AddToCart'
import { ImageGallery } from '@/components/ImageGallery'
import Price from '@/components/Price'
import { ProductAccordions } from '@/components/ProductAccordions'
import { ProductAttributes } from '@/components/ProductAttributes'
import Prose from '@/components/Prose'
import { HIDDEN_PRODUCT_TAG } from '@/lib/constants'
import { getProduct } from '@/lib/shopify'

interface PageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const product = await getProduct(params.handle)

  if (!product) return notFound()

  const { url, width, height, altText: alt } = product.featuredImage || {}
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG)

  return {
    description: product.seo.description || product.description,
    openGraph: url
      ? {
          images: [
            {
              alt,
              height,
              url,
              width,
            },
          ],
        }
      : null,
    robots: {
      follow: indexable,
      googleBot: {
        follow: indexable,
        index: indexable,
      },
      index: indexable,
    },
    title: `${product.seo.title || product.title} | Ugly Cry Vintage`,
  }
}

async function ProductDetails({ params }: PageProps) {
  const resolvedParams = await params
  const product = await getProduct(resolvedParams.handle)

  if (!product) return notFound()

  const { priceRange, featuredImage } = product

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.description,
    image: featuredImage.url,
    name: product.title,
    offers: {
      '@type': 'AggregateOffer',
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      highPrice: priceRange.maxVariantPrice.amount,
      lowPrice: priceRange.minVariantPrice.amount,
      priceCurrency: priceRange.minVariantPrice.currencyCode,
    },
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, '\\u003c'),
        }}
        type='application/ld+json'
      />
      <div className='container mx-auto grid grid-flow-row grid-cols-1 items-start gap-6 px-6 pt-16 pb-12 sm:pt-24 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8 lg:px-12'>
        <div className='w-full min-w-0'>
          <ImageGallery images={product.images} />
        </div>
        <div className='font-subheading w-full min-w-0'>
          <h1 className='font-body mb-1 text-[1.75rem] tracking-wide lg:text-[2.125rem]'>
            {product.title}
          </h1>
          <Price
            amount={priceRange.minVariantPrice.amount}
            className='text-espresso mb-3 text-sm lg:text-base'
            currencyCode={priceRange.minVariantPrice.currencyCode}
          />
          <ProductAttributes colors={product.colors} sizes={product.sizes} />
          <div className='flex flex-col-reverse lg:flex-col'>
            {product.descriptionHtml ? (
              <Prose
                className='font-subheading text-md mt-6 mb-6 leading-tight lg:mt-0'
                html={product.descriptionHtml}
              />
            ) : null}
            <AddToCart product={product} />
          </div>
          <ProductAccordions details={product.details} />
        </div>
      </div>
    </>
  )
}

export default function ProductPage(props: PageProps) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails params={props.params} />
    </Suspense>
  )
}

function ProductSkeleton() {
  return (
    <div className='container mx-auto px-6 pt-16 pb-12 sm:pt-24 md:px-12'>
      <p className='font-subheading text-espresso/70'>Loading product…</p>
    </div>
  )
}
