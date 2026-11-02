import { gql } from '@shopify/hydrogen'

export type ProductColor = {
  baseColors: string[]
  hex: string | null
  label: string
}

export type ShopifyCategoryMetafield = {
  references?: {
    nodes: Array<{
      fields: Array<{
        key: string
        value: string
      }>
    } | null>
  } | null
} | null

/** Shopify Standard Product Taxonomy color values used as color-pattern "Base color". */
const COLOR_TAXONOMY_NAMES: Record<string, string> = {
  '1': 'Black',
  '2': 'Blue',
  '3': 'White',
  '4': 'Gold',
  '5': 'Silver',
  '6': 'Beige',
  '7': 'Brown',
  '8': 'Gray',
  '9': 'Green',
  '10': 'Orange',
  '11': 'Pink',
  '12': 'Purple',
  '13': 'Red',
  '14': 'Yellow',
  '15': 'Navy',
  '16': 'Rose gold',
  '17': 'Clear',
  '657': 'Bronze',
  '2865': 'Multicolor',
}

const TAXONOMY_VALUE_ID = /gid:\/\/shopify\/TaxonomyValue\/(\d+)/

export const categoryAttributesFragment = gql(`
  fragment categoryAttributes on Product {
    color: metafield(namespace: "shopify", key: "color-pattern") {
      references(first: 10) {
        nodes {
          ... on Metaobject {
            fields {
              key
              value
            }
          }
        }
      }
    }
    size: metafield(namespace: "shopify", key: "size") {
      references(first: 10) {
        nodes {
          ... on Metaobject {
            fields {
              key
              value
            }
          }
        }
      }
    }
  }
`)

function fieldMap(fields: Array<{ key: string; value: string }>) {
  return Object.fromEntries(fields.map((field) => [field.key, field.value]))
}

function metaobjectFields(metafield?: ShopifyCategoryMetafield) {
  return (metafield?.references?.nodes ?? []).flatMap((node) =>
    node ? [fieldMap(node.fields)] : [],
  )
}

function taxonomyValueIds(raw: string | undefined): string[] {
  if (!raw?.trim()) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.flatMap((entry) =>
        typeof entry === 'string' ? taxonomyValueIds(entry) : [],
      )
    }
  } catch {
    // Single taxonomy GID strings are also valid.
  }

  const match = raw.match(TAXONOMY_VALUE_ID)
  return match ? [match[1]] : []
}

export function baseColorNames(taxonomyReference: string | undefined): string[] {
  const names = new Set<string>()

  for (const id of taxonomyValueIds(taxonomyReference)) {
    const name = COLOR_TAXONOMY_NAMES[id]
    if (name) names.add(name)
  }

  return [...names]
}

export function reshapeColors(metafield?: ShopifyCategoryMetafield): ProductColor[] {
  return metaobjectFields(metafield).flatMap((fields) => {
    const label = fields.label?.trim()
    if (!label) return []
    return [
      {
        baseColors: baseColorNames(fields.color_taxonomy_reference),
        hex: fields.color?.trim() || null,
        label,
      },
    ]
  })
}

export function reshapeSizes(metafield?: ShopifyCategoryMetafield): string[] {
  return metaobjectFields(metafield).flatMap((fields) => {
    const label = fields.label?.trim()
    return label ? [label] : []
  })
}
