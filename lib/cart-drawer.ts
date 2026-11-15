export const CART_DRAWER_ID = 'cart-drawer'
const STANDARD_ACTIONS_READY_EVENT = 'DOMContentLoaded'

let openCartActionConfigured = false
let openCartActionRetryQueued = false

function getCartDrawer() {
  if (typeof document === 'undefined') return null

  const drawer = document.getElementById(CART_DRAWER_ID)
  return drawer instanceof HTMLDialogElement ? drawer : null
}

export function openCartDrawer() {
  const drawer = getCartDrawer()
  if (!drawer || drawer.open) return
  drawer.showModal()
}

export function closeCartDrawer() {
  getCartDrawer()?.close()
}

function configureOpenCartActionNow() {
  const openCart = typeof window !== 'undefined' ? window.Shopify?.actions?.openCart : undefined
  if (!openCart) return false

  openCart.configure({
    handler: async () => openCartDrawer(),
  })
  if (openCart.isDefault()) return false

  openCartActionConfigured = true
  return true
}

export function configureOpenCartAction() {
  if (typeof document === 'undefined' || openCartActionConfigured) return
  if (configureOpenCartActionNow()) return
  if (openCartActionRetryQueued) return

  openCartActionRetryQueued = true

  if (document.readyState === 'loading') {
    document.addEventListener(
      STANDARD_ACTIONS_READY_EVENT,
      () => {
        openCartActionRetryQueued = false
        configureOpenCartAction()
      },
      { once: true },
    )
    return
  }

  const deadline = Date.now() + 10_000
  const retry = () => {
    if (configureOpenCartActionNow() || Date.now() > deadline) {
      openCartActionRetryQueued = false
      return
    }
    window.setTimeout(retry, 50)
  }
  retry()
}

configureOpenCartAction()
