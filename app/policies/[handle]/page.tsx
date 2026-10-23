import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

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

export default async function PolicyPage(props: PolicyPageProps) {
  const params = await props.params
  const policy = await getShopPolicy(params.handle)

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
