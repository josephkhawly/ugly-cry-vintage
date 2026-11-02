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

const TAXONOMY_VALUE_ID = /gid:\/\/shopify\/TaxonomyValue\/(\d+)/g

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

function baseColorNames(taxonomyReference: string | undefined): string[] {
  if (!taxonomyReference) return []

  const names = new Set<string>()
  for (const match of taxonomyReference.matchAll(TAXONOMY_VALUE_ID)) {
    const name = COLOR_TAXONOMY_NAMES[match[1]]
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
