'use client'

import type { Menu } from '@/lib/shopify/types'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { HiChevronDown, HiMagnifyingGlass, HiOutlineBars3 } from 'react-icons/hi2'
import logo from '../public/logo.webp'
import { AnnouncementBar } from './AnnouncementBar'
import { CartTrigger } from './cart/CartModal'

type Panel = 'menu' | 'search'

interface HeaderClientProps {
  items: Menu[]
  shopItems: Menu[]
}

export function HeaderClient({ items, shopItems }: HeaderClientProps) {
  const [panel, setPanel] = useState<Panel | null>(null)
  const [content, setContent] = useState<Panel | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  function close() {
    setPanel(null)
    setExpanded(false)
    setShopOpen(false)
  }

  function open(next: Panel) {
    setContent(next)
    setPanel(next)
    if (next !== 'menu') setShopOpen(false)
    if (expanded) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setExpanded(true))
    })
  }

  function toggleMenu() {
    if (panel === 'menu') close()
    else open('menu')
  }

  function toggleSearch() {
    if (panel === 'search') close()
    else open('search')
  }

  function onDrawerTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    if (event.propertyName !== 'grid-template-rows') return
    if (!expanded) setContent(null)
  }

  useEffect(() => {
    if (!expanded) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }

    function onPointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        close()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [expanded])

  useEffect(() => {
    if (panel === 'search' && expanded) searchInputRef.current?.focus()
  }, [expanded, panel])

  return (
    <header className='sticky top-0 z-20 pt-[env(safe-area-inset-top)]'>
      <AnnouncementBar />
      <div className='px-3 pt-3 md:px-6 md:pt-5'>
        <div className='relative mx-auto w-full max-w-130'>
          {/* Reserves collapsed height so expansion overlays instead of pushing the page */}
          <div
            aria-hidden='true'
            className='invisible grid grid-cols-3 items-center border border-transparent px-3 py-2 md:px-5 md:py-2.5'
          >
            <span className='flex size-11 md:size-14' />
            <span className='mx-auto h-10 md:h-14' />
            <span className='flex items-center gap-2 justify-self-end'>
              <span className='size-11 md:size-14' />
              <span className='size-11 md:size-14' />
            </span>
          </div>

          <div
            className={clsx(
              'bg-teal/50 absolute inset-x-0 top-0 overflow-hidden rounded-[50px] border border-black text-black backdrop-blur-sm',
              content && 'z-30',
            )}
            ref={panelRef}
          >
            <div className='grid grid-cols-3 items-center px-3 py-2 md:px-5 md:py-2.5'>
              <button
                aria-expanded={panel === 'menu'}
                aria-label={panel === 'menu' ? 'Close menu' : 'Open menu'}
                className='flex cursor-pointer items-center gap-2 justify-self-start'
                onClick={toggleMenu}
                type='button'
              >
                <span
                  className={clsx(
                    'flex size-11 items-center justify-center rounded-full border border-black transition-colors duration-300 md:size-14',
                    panel === 'menu' && 'bg-white',
                  )}
                >
                  <HiOutlineBars3 className='size-6 md:size-7' />
                </span>
              </button>

              <Link className='justify-self-center' href='/' onClick={close} prefetch={true}>
                <Image alt='Ugly Cry Vintage' className='h-10 w-auto md:h-20' priority src={logo} />
              </Link>

              <div className='flex items-center gap-2 justify-self-end'>
                <button
                  aria-expanded={panel === 'search'}
                  aria-label={panel === 'search' ? 'Close search' : 'Open search'}
                  className='flex cursor-pointer items-center'
                  onClick={toggleSearch}
                  type='button'
                >
                  <span
                    className={clsx(
                      'flex size-11 items-center justify-center rounded-full border border-black transition-colors duration-300 md:size-14',
                      panel === 'search' && 'bg-white',
                    )}
                  >
                    <HiMagnifyingGlass className='size-6 md:size-7' />
                  </span>
                </button>
                <CartTrigger />
              </div>
            </div>

            <div
              className={clsx(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
              onTransitionEnd={onDrawerTransitionEnd}
            >
              <div className='min-h-0 overflow-hidden'>
                {content === 'menu' ? (
                  <nav aria-label='Primary'>
                    <ul>
                      {items.map((item) => {
                        if (item.title.toLowerCase() === 'shop') {
                          return (
                            <li className='border-t border-black' key={item.title}>
                              <button
                                aria-expanded={shopOpen}
                                className='font-subheading hover:text-espresso flex w-full cursor-pointer items-center justify-center gap-2 py-4 text-2xl tracking-wide italic transition-colors md:text-3xl'
                                onClick={() => setShopOpen((open) => !open)}
                                type='button'
                              >
                                {item.title}
                                <HiChevronDown
                                  className={clsx(
                                    'size-5 transition-transform duration-200 md:size-6',
                                    shopOpen && 'rotate-180',
                                  )}
                                />
                              </button>
                              <div
                                className={clsx(
                                  'grid transition-[grid-template-rows] duration-300 ease-out',
                                  shopOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                                )}
                              >
                                <ul className='min-h-0 overflow-hidden'>
                                  {shopItems.map((shopItem) => (
                                    <li key={shopItem.path}>
                                      <Link
                                        className='font-subheading data-[active=true]:text-espresso block py-1.5 text-center text-lg tracking-wide italic transition-colors hover:text-white md:text-xl'
                                        data-active={pathname === shopItem.path}
                                        href={shopItem.path}
                                        onClick={close}
                                        prefetch={true}
                                      >
                                        {shopItem.title}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </li>
                          )
                        }

                        return (
                          <li className='border-t border-black' key={item.title}>
                            <Link
                              className='font-subheading hover:text-espresso data-[active=true]:text-espresso block py-4 text-center text-2xl tracking-wide italic transition-colors md:text-3xl'
                              data-active={pathname === item.path}
                              href={item.path}
                              onClick={close}
                              prefetch={true}
                            >
                              {item.title}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                    <div className='flex items-center justify-end gap-5 border-t border-black px-5 py-4'>
                      <a
                        className='font-subheading hover:text-espresso text-sm uppercase transition-colors'
                        href='https://uglycryvintage.substack.com/'
                        rel='noopener noreferrer'
                        target='_blank'
                      >
                        Subscribe
                      </a>
                    </div>
                  </nav>
                ) : null}

                {content === 'search' ? (
                  <form
                    action='/search'
                    className='flex items-center gap-4 border-t border-black px-5 py-4'
                    method='get'
                    role='search'
                  >
                    <input
                      className='font-subheading w-full bg-transparent text-sm uppercase outline-none placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-black/40'
                      name='q'
                      placeholder='Type to search'
                      ref={searchInputRef}
                      type='search'
                    />
                    <button
                      className='font-subheading shrink-0 text-sm text-black/40 uppercase transition-colors hover:text-black'
                      type='reset'
                    >
                      Clear
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
