import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { sanitizeShopifyHtml } from './sanitize-shopify-html'

describe('sanitizeShopifyHtml', () => {
  it('strips stray Shopify <base> tags without dropping surrounding rich text', () => {
    const html =
      '<p><base href="https://vintage-for-yall.myshopify.com/"><strong>How do I find out the condition of an item?</strong></p>\n' +
      '<p><base href="https://vintage-for-yall.myshopify.com/"><strong>When will my order ship?</strong></p>'

    const sanitized = sanitizeShopifyHtml(html)

    assert.equal(sanitized.includes('<base'), false)
    assert.equal(sanitized.includes('vintage-for-yall.myshopify.com'), false)
    assert.match(sanitized, /<p><strong>How do I find out the condition of an item\?<\/strong><\/p>/)
    assert.match(sanitized, /<p><strong>When will my order ship\?<\/strong><\/p>/)
  })

  it('strips script elements and their contents', () => {
    const sanitized = sanitizeShopifyHtml(
      '<p>Hello</p><script>alert(1)</script><p>World</p><script src="https://evil.example/x.js"></script>',
    )

    assert.equal(sanitized.includes('<script'), false)
    assert.equal(sanitized.includes('alert(1)'), false)
    assert.equal(sanitized.includes('evil.example'), false)
    assert.match(sanitized, /<p>Hello<\/p>/)
    assert.match(sanitized, /<p>World<\/p>/)
  })

  it('strips inline event handlers and javascript: URLs', () => {
    const sanitized = sanitizeShopifyHtml(
      '<p><a href="javascript:alert(1)" onclick="alert(2)">FAQ</a> <img src="https://cdn.shopify.com/x.jpg" onerror="alert(3)" alt="tee"></p>',
    )

    assert.equal(/on\w+\s*=/i.test(sanitized), false)
    assert.equal(sanitized.toLowerCase().includes('javascript:'), false)
    assert.match(sanitized, /<a>FAQ<\/a>/)
    assert.match(sanitized, /src="https:\/\/cdn\.shopify\.com\/x\.jpg"/)
    assert.match(sanitized, /alt="tee"/)
  })

  it('keeps headings, lists, links, images, and embed iframes', () => {
    const html = [
      '<h2>Shipping</h2>',
      '<ul><li>One of a kind</li></ul>',
      '<p><a href="https://www.uglycryvintage.com/faq">FAQ</a></p>',
      '<p><img src="https://cdn.shopify.com/s/files/1/x.jpg" alt="jacket" width="400" height="500"></p>',
      '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="video" width="560" height="315" allowfullscreen></iframe>',
    ].join('')

    const sanitized = sanitizeShopifyHtml(html)

    assert.match(sanitized, /<h2>Shipping<\/h2>/)
    assert.match(sanitized, /<ul><li>One of a kind<\/li><\/ul>/)
    assert.match(sanitized, /href="https:\/\/www\.uglycryvintage\.com\/faq"/)
    assert.match(sanitized, /src="https:\/\/cdn\.shopify\.com\/s\/files\/1\/x\.jpg"/)
    assert.match(sanitized, /src="https:\/\/www\.youtube\.com\/embed\/dQw4w9WgXcQ"/)
    assert.match(sanitized, /allowfullscreen/)
  })
})
