import { gql } from '@shopify/hydrogen'

export const mediaFragment = gql(`
  fragment mediaFieldsByType on Media {
    __typename
    ... on MediaImage {
      image {
        altText
        height
        url
        width
      }
    }
  }
`)
