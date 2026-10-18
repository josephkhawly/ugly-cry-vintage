import { getPublicStoreDomain } from '../env'
import { ensureStartsWith } from '../utils'

const ADMIN_API_VERSION = '2026-10'

const CUSTOMER_CREATE_MUTATION = /* GraphQL */ `
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

const CUSTOMER_BY_EMAIL_QUERY = /* GraphQL */ `
  query customerByEmail($query: String!) {
    customers(first: 1, query: $query) {
      edges {
        node {
          id
          emailMarketingConsent {
            marketingState
          }
        }
      }
    }
  }
`

const CUSTOMER_BY_ID_QUERY = /* GraphQL */ `
  query customerById($id: ID!) {
    customer(id: $id) {
      id
      emailMarketingConsent {
        marketingState
      }
    }
  }
`

const CUSTOMER_EMAIL_MARKETING_CONSENT_UPDATE = /* GraphQL */ `
  mutation customerEmailMarketingConsentUpdate(
    $input: CustomerEmailMarketingConsentUpdateInput!
  ) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

type AdminGraphqlResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

type CustomerCreateData = {
  customerCreate: {
    customer: { id: string } | null
    userErrors: Array<{ field: string[] | null; message: string }>
  }
}

type CustomerNode = {
  id: string
  emailMarketingConsent: { marketingState: string } | null
}

type CustomerByEmailData = {
  customers: {
    edges: Array<{
      node: CustomerNode
    }>
  }
}

type CustomerByIdData = {
  customer: CustomerNode | null
}

type ConsentUpdateData = {
  customerEmailMarketingConsentUpdate: {
    customer: { id: string } | null
    userErrors: Array<{ field: string[] | null; message: string }>
  }
}

export type NewsletterSubscribeResult =
  | { status: 'already_subscribed'; customerId: string }
  | { status: 'confirmation_required'; customerId: string }

export type NewsletterConfirmResult =
  | 'confirmed'
  | 'already_subscribed'
  | 'rejected'

// Stay NOT_SUBSCRIBED until confirm — Klaviyo treats Shopify PENDING as subscribe and races Resend.
const notSubscribedConsent = {
  marketingState: 'NOT_SUBSCRIBED' as const,
}

const subscribedConsent = {
  marketingState: 'SUBSCRIBED' as const,
  marketingOptInLevel: 'CONFIRMED_OPT_IN' as const,
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function escapeShopifySearchPhrase(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function getAdminEndpoint(): string {
  const domain = getPublicStoreDomain()
  const base = ensureStartsWith(domain, 'https://')
  return `${base}/admin/api/${ADMIN_API_VERSION}/graphql.json`
}

async function adminFetch<T>({
  query,
  variables,
}: {
  query: string
  variables?: Record<string, unknown>
}): Promise<T> {
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('Newsletter signup is not configured')
  }

  const response = await fetch(getAdminEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  const body = (await response.json()) as AdminGraphqlResponse<T>

  if (!response.ok || body.errors?.length || !body.data) {
    console.error('Shopify Admin API error:', response.status, body)
    throw new Error('Failed to subscribe to newsletter')
  }

  return body.data
}

function isEmailTakenError(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('email') && (lower.includes('taken') || lower.includes('already'))
}

async function findCustomerByEmail(email: string) {
  const normalized = normalizeEmail(email)
  const lookup = await adminFetch<CustomerByEmailData>({
    query: CUSTOMER_BY_EMAIL_QUERY,
    variables: {
      query: `email:"${escapeShopifySearchPhrase(normalized)}"`,
    },
  })

  return lookup.customers.edges[0]?.node ?? null
}

async function getCustomerById(customerId: string) {
  const lookup = await adminFetch<CustomerByIdData>({
    query: CUSTOMER_BY_ID_QUERY,
    variables: { id: customerId },
  })

  return lookup.customer
}

async function setCustomerMarketingConsent(
  customerId: string,
  emailMarketingConsent: typeof notSubscribedConsent | typeof subscribedConsent,
) {
  const update = await adminFetch<ConsentUpdateData>({
    query: CUSTOMER_EMAIL_MARKETING_CONSENT_UPDATE,
    variables: {
      input: {
        customerId,
        emailMarketingConsent,
      },
    },
  })

  const { customer, userErrors } = update.customerEmailMarketingConsentUpdate
  if (userErrors.length > 0 || !customer) {
    console.error('Shopify consent update errors:', userErrors)
    throw new Error('Failed to subscribe to newsletter')
  }
}

async function prepareExistingCustomer(
  email: string,
): Promise<NewsletterSubscribeResult> {
  const customer = await findCustomerByEmail(email)
  if (!customer) {
    throw new Error('Failed to subscribe to newsletter')
  }

  if (customer.emailMarketingConsent?.marketingState === 'SUBSCRIBED') {
    return { status: 'already_subscribed', customerId: customer.id }
  }

  // Clear UNSUBSCRIBED on re-opt-in so the new confirm link can complete.
  if (customer.emailMarketingConsent?.marketingState === 'UNSUBSCRIBED') {
    await setCustomerMarketingConsent(customer.id, notSubscribedConsent)
  }

  return { status: 'confirmation_required', customerId: customer.id }
}

export async function subscribeEmailToNewsletter(
  email: string,
): Promise<NewsletterSubscribeResult> {
  const create = await adminFetch<CustomerCreateData>({
    query: CUSTOMER_CREATE_MUTATION,
    variables: {
      input: {
        email: normalizeEmail(email),
      },
    },
  })

  const { customer, userErrors } = create.customerCreate

  if (customer && userErrors.length === 0) {
    return { status: 'confirmation_required', customerId: customer.id }
  }

  if (userErrors.some((error) => isEmailTakenError(error.message))) {
    return prepareExistingCustomer(email)
  }

  console.error('Shopify customerCreate errors:', userErrors)
  throw new Error('Failed to subscribe to newsletter')
}

export async function confirmEmailMarketingSubscription(
  customerId: string,
): Promise<NewsletterConfirmResult> {
  const customer = await getCustomerById(customerId)
  if (!customer) {
    return 'rejected'
  }

  // Allow NOT_SUBSCRIBED/PENDING; refuse UNSUBSCRIBED so a stale link cannot restore consent.
  const state = customer.emailMarketingConsent?.marketingState ?? 'NOT_SUBSCRIBED'
  if (state === 'SUBSCRIBED') {
    return 'already_subscribed'
  }
  if (state !== 'NOT_SUBSCRIBED' && state !== 'PENDING') {
    return 'rejected'
  }

  await setCustomerMarketingConsent(customerId, subscribedConsent)
  return 'confirmed'
}
