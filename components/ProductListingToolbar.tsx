'use client'

import { useRouter } from 'next/navigation'
import type * as React from 'react'
import { useRef } from 'react'
import { HiOutlineXMark } from 'react-icons/hi2'

import { sorting } from '@/lib/constants'
import { hasActiveFilters } from '@/lib/plp-filters'
import type { PlpFacets, PlpFilters } from '@/lib/plp-filters'

const FILTER_DRAWER_ID = 'filter-drawer'

interface ProductListingToolbarProps {
  actionPath: string
  facets: PlpFacets
  filters: PlpFilters
  sort: string | null
}

export function ProductListingToolbar({
  actionPath,
  facets,
  filters,
  sort,
}: ProductListingToolbarProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const router = useRouter()
  const active = hasActiveFilters(filters)

  function openDrawer() {
    dialogRef.current?.showModal()
  }

  function closeDrawer() {
    dialogRef.current?.close()
  }

  function onSortChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams()
    appendFilters(params, filters)
    if (event.target.value) params.set('sort', event.target.value)
    const query = params.toString()
    router.push(query ? `${actionPath}?${query}` : actionPath)
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const params = new URLSearchParams()

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value) params.append(key, value)
    }

    const query = params.toString()
    closeDrawer()
    router.push(query ? `${actionPath}?${query}` : actionPath)
  }

  function clearFilters() {
    const params = new URLSearchParams()
    if (sort && sort !== defaultSortSlug()) params.set('sort', sort)
    const query = params.toString()
    closeDrawer()
    router.push(query ? `${actionPath}?${query}` : actionPath)
  }

  return (
    <div className='mb-8 flex items-center justify-between gap-4 px-2'>
      <button
        aria-controls={FILTER_DRAWER_ID}
        aria-haspopup='dialog'
        className='font-subheading cursor-pointer text-sm tracking-wide uppercase underline underline-offset-4'
        onClick={openDrawer}
        type='button'
      >
        {active ? 'Filters' : 'Filter'}
      </button>

      <label className='font-subheading flex items-center gap-2 text-sm tracking-wide uppercase'>
        <span className='sr-only'>Sort</span>
        <select
          className='cursor-pointer border border-black bg-transparent px-3 py-2'
          defaultValue={sort ?? defaultSortSlug()}
          key={sort ?? defaultSortSlug()}
          onChange={onSortChange}
        >
          {sorting.map((item) => (
            <option key={item.slug ?? 'default'} value={item.slug ?? ''}>
              {item.title}
            </option>
          ))}
        </select>
      </label>

      <dialog
        aria-labelledby='filter-drawer-title'
        className='filter-drawer bg-teal/50 flex-col border-r border-black text-black backdrop-blur-sm open:flex'
        closedby='any'
        id={FILTER_DRAWER_ID}
        ref={dialogRef}
      >
        <div className='flex shrink-0 items-center justify-between gap-4 p-6 pb-2'>
          <h2 className='font-subheading text-xl tracking-wide uppercase' id='filter-drawer-title'>
            Filter
          </h2>
          <button
            aria-label='Close filter'
            className='cursor-pointer p-2 text-black'
            onClick={closeDrawer}
            type='button'
          >
            <HiOutlineXMark className='size-8' />
          </button>
        </div>

        <form className='flex min-h-0 flex-1 flex-col overflow-hidden' onSubmit={applyFilters}>
          {sort && sort !== defaultSortSlug() ? (
            <input name='sort' type='hidden' value={sort} />
          ) : null}
          <div className='flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-6 pb-4'>
            <FilterGroup name='size' options={facets.sizes} selected={filters.size} title='Size' />
            <ColorFilterGroup options={facets.colors} selected={filters.color} />
            <FilterGroup name='type' options={facets.types} selected={filters.type} title='Type' />
            <FilterGroup name='era' options={facets.eras} selected={filters.era} title='Era' />
          </div>

          <div className='flex shrink-0 gap-3 border-t border-black/20 p-6'>
            <button
              className='font-subheading flex-1 cursor-pointer rounded-full border border-black px-4 py-3 text-sm tracking-wide uppercase'
              onClick={clearFilters}
              type='button'
            >
              Clear
            </button>
            <button
              className='font-subheading flex-1 cursor-pointer rounded-full border border-black bg-black px-4 py-3 text-sm tracking-wide text-white uppercase'
              type='submit'
            >
              Apply
            </button>
          </div>
        </form>
      </dialog>
    </div>
  )
}

function defaultSortSlug() {
  return sorting[0]?.slug ?? ''
}

function appendFilters(params: URLSearchParams, filters: PlpFilters) {
  for (const value of filters.size) params.append('size', value)
  for (const value of filters.color) params.append('color', value)
  for (const value of filters.type) params.append('type', value)
  for (const value of filters.era) params.append('era', value)
}

interface FilterGroupProps {
  name: 'era' | 'size' | 'type'
  options: readonly string[]
  selected: string[]
  title: string
}

function FilterGroup({ name, options, selected, title }: FilterGroupProps) {
  if (options.length === 0) return null

  return (
    <fieldset>
      <legend className='font-subheading mb-3 text-sm tracking-wide uppercase'>{title}</legend>
      <ul className='flex flex-wrap gap-2'>
        {options.map((option) => (
          <li key={option}>
            <FilterPill
              defaultChecked={selected.includes(option)}
              label={option}
              name={name}
              value={option}
            />
          </li>
        ))}
      </ul>
    </fieldset>
  )
}

interface ColorFilterGroupProps {
  options: PlpFacets['colors']
  selected: string[]
}

function ColorFilterGroup({ options, selected }: ColorFilterGroupProps) {
  if (options.length === 0) return null

  return (
    <fieldset>
      <legend className='font-subheading mb-3 text-sm tracking-wide uppercase'>Color</legend>
      <ul className='flex flex-wrap gap-2'>
        {options.map((color) => (
          <li key={color.label}>
            <FilterPill
              defaultChecked={
                selected.includes(color.label) ||
                color.aliases.some((alias) => selected.includes(alias))
              }
              hex={color.hex}
              label={color.label}
              name='color'
              value={color.label}
            />
          </li>
        ))}
      </ul>
    </fieldset>
  )
}

interface FilterPillProps {
  defaultChecked: boolean
  hex?: string | null
  label: string
  name: 'color' | 'era' | 'size' | 'type'
  value: string
}

function FilterPill({ defaultChecked, hex, label, name, value }: FilterPillProps) {
  return (
    <label className='inline-flex cursor-pointer items-center gap-2 rounded-full border border-black px-3.5 py-1.5 text-sm has-[:checked]:bg-black has-[:checked]:text-white'>
      <input
        className='sr-only'
        defaultChecked={defaultChecked}
        key={`${name}-${value}-${defaultChecked}`}
        name={name}
        type='checkbox'
        value={value}
      />
      {hex ? (
        <span
          aria-hidden
          className='size-4 shrink-0 rounded-full border border-black/40'
          style={{ backgroundColor: hex }}
        />
      ) : null}
      <span>{label}</span>
    </label>
  )
}
