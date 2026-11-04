import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import Prose from '@/components/Prose'
import { getShopPolicy } from '@/lib/shopify'

interface PolicyPageProps {
  params: Promise<{ handle: string }>
}

function policyDescription(body: string) {
  return body
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

export async function generateMetadata(props: PolicyPageProps): Promise<Metadata> {
  const params = await props.params
  const policy = await getShopPolicy(params.handle)

  if (!policy) return notFound()

  return {
    description: policyDescription(policy.body) || policy.title,
    title: policy.title,
  }
}

async function PolicyContent({ params }: PolicyPageProps) {
  const resolvedParams = await params
  const policy = await getShopPolicy(resolvedParams.handle)

  if (!policy) return notFound()

  return (
    <section>
      <h1 className='mb-8 pt-16 text-center text-4xl sm:pt-24 sm:text-6xl'>{policy.title}</h1>
      <div className='mx-8 max-w-2xl sm:mx-auto'>
        <Prose className='mb-8' html={policy.body} />
      </div>
    </section>
  )
}

export default function PolicyPage(props: PolicyPageProps) {
  return (
    <Suspense
      fallback={
        <section>
          <h1 className='mb-8 pt-16 text-center text-4xl sm:pt-24 sm:text-6xl'>Loading…</h1>
        </section>
      }
    >
      <PolicyContent params={props.params} />
    </Suspense>
  )
}
