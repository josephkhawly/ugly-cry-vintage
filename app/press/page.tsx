import { pressClippings } from '@/lib/writingSamples'
import Image from 'next/image'
import type { Metadata } from 'next'
import { PageContainer } from '@/components/PageContainer'

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: 'Press | Ugly Cry Vintage',
  description: '',
}

export default function Press() {
  return (
    <PageContainer>
      <div className='items-start justify-between lg:flex'>
        <h1 className='font-frogmore text-espresso mb-8 text-6xl tracking-wide lg:text-9xl'>
          Published Press
        </h1>
        <div>
          {pressClippings.map((clipping) => (
            <div key={clipping.url} className='mb-4'>
              <a href={clipping.url} target='_blank' rel='noopener noreferrer'>
                <Image src={clipping.image} alt={clipping.alt} width={600} height={600} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
