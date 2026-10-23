import sanitizeHtml from 'sanitize-html'

const ALLOWED_ATTRIBUTES: NonNullable<sanitizeHtml.IOptions['allowedAttributes']> = {
  '*': ['class', 'dir', 'id', 'lang', 'role', 'title'],
  a: ['href', 'name', 'rel', 'target'],
  audio: ['controls', 'loop', 'muted', 'preload', 'src'],
  iframe: [
    'allow',
    'allowfullscreen',
    'frameborder',
    'height',
    'loading',
    'name',
    'referrerpolicy',
    'src',
    'title',
    'width',
  ],
  img: ['alt', 'decoding', 'height', 'loading', 'sizes', 'src', 'srcset', 'title', 'width'],
  source: ['media', 'sizes', 'src', 'srcset', 'type'],
  td: ['colspan', 'headers', 'rowspan'],
  th: ['colspan', 'headers', 'rowspan', 'scope'],
  video: ['controls', 'height', 'loop', 'muted', 'playsinline', 'poster', 'preload', 'src', 'width'],
}

const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  'audio',
  'iframe',
  'img',
  'picture',
  'source',
  'video',
]

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['data', 'http', 'https'],
    source: ['data', 'http', 'https'],
  },
  allowedTags: ALLOWED_TAGS,
  allowProtocolRelative: false,
}

export function sanitizeShopifyHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS)
}
