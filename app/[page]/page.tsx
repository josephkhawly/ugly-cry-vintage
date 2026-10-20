import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import Prose from '@/components/Prose'
import { getPage } from '@/lib/shopify'

const RESERVED_PAGE_HANDLES = new Set([
  'account',
  'admin',
  'api',
  'checkout',
  'product',
  'products',
  'collections',
  'graphiql',
  'product',
  'products',
  'search',
  'shop',
])

export async function generateMetadata(props: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const params = await props.params
  if (RESERVED_PAGE_HANDLES.has(params.page)) return notFound()

  const page = await getPage(params.page)

  if (!page) return notFound()

  return {
    description: page.seo?.description || page.bodySummary,
    openGraph: {
      modifiedTime: page.updatedAt,
      publishedTime: page.createdAt,
      type: 'article',
    },
    title: page.seo?.title || page.title,
  }
}

async function CmsPageContent({ params }: { params: Promise<{ page: string }> }) {
  const resolvedParams = await params
  if (RESERVED_PAGE_HANDLES.has(resolvedParams.page)) return notFound()

  const page = await getPage(resolvedParams.page)

  if (!page) return notFound()

  return (
    <section>
      <h1 className='mb-8 pt-16 text-center text-4xl sm:pt-24 sm:text-6xl'>{page.title}</h1>
      <div className='mx-8 max-w-2xl sm:mx-auto'>
        <Prose className='mb-8' html={page.body as string} />
      </div>
    </section>
  )
}

export default function Page(props: { params: Promise<{ page: string }> }) {
  return (
    <Suspense
      fallback={
        <section>
          <h1 className='mb-8 pt-16 text-center text-4xl sm:pt-24 sm:text-6xl'>Loading…</h1>
        </section>
      }
    >
      <CmsPageContent params={props.params} />
    </Suspense>
  )
}
