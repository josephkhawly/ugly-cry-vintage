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

function retryConfigureOpenCartAction() {
  openCartActionRetryQueued = false
  configureOpenCartAction()
}

function onStandardActionsScriptLoad(event: Event) {
  if (
    !(event.target instanceof HTMLScriptElement) ||
    !event.target.src.includes('standard-actions')
  ) {
    return
  }

  document.removeEventListener('load', onStandardActionsScriptLoad, true)
  retryConfigureOpenCartAction()
}

export function configureOpenCartAction() {
  if (typeof document === 'undefined' || openCartActionConfigured) return
  if (configureOpenCartActionNow()) return
  if (openCartActionRetryQueued) return

  openCartActionRetryQueued = true

  if (document.readyState === 'loading') {
    document.addEventListener(STANDARD_ACTIONS_READY_EVENT, retryConfigureOpenCartAction, {
      once: true,
    })
  }

  document.addEventListener('load', onStandardActionsScriptLoad, true)

  const script = document.querySelector('script[src*="standard-actions"]')
  if (script instanceof HTMLScriptElement) {
    script.addEventListener('load', retryConfigureOpenCartAction, { once: true })
  }
}

configureOpenCartAction()
