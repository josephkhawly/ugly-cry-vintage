import { AddToCart } from '@/components/cart/AddToCart'
import { ImageGallery } from '@/components/ImageGallery'
import Price from '@/components/Price'
import { ProductAccordions } from '@/components/ProductAccordions'
import { ProductAttributes } from '@/components/ProductAttributes'
import Prose from '@/components/Prose'
import { HIDDEN_PRODUCT_TAG } from '@/lib/constants'
import { resolveProductImage, resolveProductImages } from '@/lib/product-image'
import { getProduct } from '@/lib/shopify'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const product = await getProduct(params.handle)

  if (!product) return notFound()

  const image = resolveProductImage(product.featuredImage, product.images, product.title)
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG)

  return {
    title: `${product.seo.title || product.title} | Ugly Cry Vintage`,
    description: product.seo.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: {
      images: [
        {
          alt: image.altText,
          height: image.height,
          url: image.url,
          width: image.width,
        },
      ],
    },
  }
}

export default async function ProductPage(props: PageProps) {
  const params = await props.params
  const product = await getProduct(params.handle)

  if (!product) return notFound()

  const { priceRange } = product
  const featuredImage = resolveProductImage(product.featuredImage, product.images, product.title)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: featuredImage.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceCurrency: priceRange.minVariantPrice.currencyCode,
      highPrice: priceRange.maxVariantPrice.amount,
      lowPrice: priceRange.minVariantPrice.amount,
    },
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className='container mx-auto grid grid-flow-row grid-cols-1 items-start gap-6 px-6 pt-16 pb-12 sm:pt-24 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8 lg:px-12'>
        <div className='w-full min-w-0'>
          <ImageGallery images={resolveProductImages(product.images, product.title)} />
        </div>
        <div className='font-subheading w-full min-w-0'>
          <h1 className='font-body mb-1 text-[1.75rem] tracking-wide lg:text-[2.125rem]'>
            {product.title}
          </h1>
          <Price
            amount={priceRange.minVariantPrice.amount}
            currencyCode={priceRange.minVariantPrice.currencyCode}
            className='text-espresso mb-3 text-sm lg:text-base'
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
