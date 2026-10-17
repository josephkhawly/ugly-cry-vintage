import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import Prose from '@/components/Prose'
import { getPage } from '@/lib/shopify'

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const RESERVED_PAGE_HANDLES = new Set([
  'admin',
  'account',
  'api',
  'checkout',
  'product',
  'products',
  'collections',
  'graphiql',
])

export async function generateMetadata(props: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const params = await props.params
  if (RESERVED_PAGE_HANDLES.has(params.page)) return notFound()

  const page = await getPage(params.page)

  if (!page) return notFound()

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
    openGraph: {
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      type: 'article',
    },
  }
}

export default async function Page(props: { params: Promise<{ page: string }> }) {
  const params = await props.params
  if (RESERVED_PAGE_HANDLES.has(params.page)) return notFound()

  const page = await getPage(params.page)

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
