import { XMLParser } from 'fast-xml-parser'
import { decode } from 'html-entities'

interface SubstackPost {
  title: string
  link: string
  pubDate: string
  description: string
  previewImage?: string
}

function extractImage(item: any): string | null {
  const enclosure = item.enclosure
  if (enclosure) {
    const url = Array.isArray(enclosure) ? enclosure[0]['@_url'] : enclosure['@_url']
    if (url && url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
      return url
    }
  }

  return null
}

export async function fetchSubstackPosts(): Promise<SubstackPost[]> {
  const res = await fetch('https://uglycryvintage.substack.com/feed', {
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch Substack feed')
  }

  const xml = await res.text()
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    attributeNamePrefix: '@_',
  })

  const parsed = parser.parse(xml)
  const items = parsed.rss?.channel?.item ?? []

  return items.map((item: Record<string, unknown>) => ({
    title: item.title as string,
    link: item.link as string,
    pubDate: item.pubDate as string,
    description: (item['content:encoded'] || item.description) as string,
    previewImage: extractImage(item),
  }))
}

export function extractPreview(html: string, maxLength = 280): string {
  const decoded = decode(html, { level: 'html5' })

  const text = decoded
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text

  const truncated = text.slice(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('.')

  if (lastPeriod > maxLength * 0.6) {
    return truncated.slice(0, lastPeriod + 1)
  }

  const lastSpace = truncated.lastIndexOf(' ')
  return truncated.slice(0, lastSpace) + '...'
}
