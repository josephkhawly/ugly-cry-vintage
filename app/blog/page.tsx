import Image from 'next/image'
import { extractPreview, fetchSubstackPosts } from '@/lib/substack'

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

function ReadMoreLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='bg-sandy-clay text-espresso inline-block w-fit cursor-pointer rounded-md px-4 py-2 tracking-wide hover:opacity-90'
    >
      Read More
    </a>
  )
}

export default async function BlogPage() {
  const posts = (await fetchSubstackPosts()).filter((post) => post.title !== 'Coming soon')
  const [featured, ...rest] = posts

  return (
    <div className='mx-auto max-w-6xl px-4 py-12'>
      <h1 className='font-frogmore text-espresso mb-8 text-center text-4xl tracking-wide sm:text-6xl'>
        From the Blog
      </h1>

      {featured ? (
        <article
          key={featured.link}
          className='mb-10 flex flex-col overflow-hidden rounded-xl border-2 bg-gray-50/50 md:mb-12'
        >
          {featured.previewImage ? (
            <div className='relative aspect-2/1 w-full bg-gray-200'>
              <Image
                src={featured.previewImage}
                alt={featured.title}
                fill
                className='object-cover'
                sizes='(max-width: 1152px) 100vw, 1152px'
                priority
              />
            </div>
          ) : null}
          <div className='flex grow flex-col p-8 md:p-10'>
            <div className='mb-4 flex flex-wrap items-center gap-3'>
              <span className='bg-teal/50 text-espresso rounded-md px-2.5 py-1 text-xs font-semibold tracking-wider uppercase'>
                Latest
              </span>
              <time className='text-sm text-gray-500'>
                {new Date(featured.pubDate).toLocaleDateString()}
              </time>
            </div>
            <h2 className='mb-4 text-2xl leading-tight font-bold tracking-tight sm:text-3xl md:text-4xl'>
              {featured.title}
            </h2>
            <p className='mb-6 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg'>
              {extractPreview(featured.description, 400)}
            </p>
            <ReadMoreLink href={featured.link} />
          </div>
        </article>
      ) : null}

      {rest.length > 0 ? (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {rest.map((post) => (
            <article key={post.link} className='flex flex-col overflow-hidden rounded-lg border'>
              {post.previewImage ? (
                <div className='relative aspect-16/10 w-full shrink-0 bg-gray-200'>
                  <Image
                    src={post.previewImage}
                    alt={post.title}
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  />
                </div>
              ) : null}
              <div className='flex grow flex-col p-6'>
                <time className='mb-2 text-sm text-gray-500'>
                  {new Date(post.pubDate).toLocaleDateString()}
                </time>
                <h2 className='mb-3 text-xl leading-tight font-semibold'>{post.title}</h2>
                <p className='mb-4 grow leading-relaxed text-gray-600'>
                  {extractPreview(post.description)}
                </p>
                <ReadMoreLink href={post.link} />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
