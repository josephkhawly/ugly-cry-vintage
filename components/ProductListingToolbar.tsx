'use client'

import Link from 'next/link'
import type * as React from 'react'
import { useRef } from 'react'
import { HiOutlineXMark } from 'react-icons/hi2'

import { sorting } from '@/lib/constants'
import { hasActiveFilters, type PlpFacets, type PlpFilters } from '@/lib/plp-filters'

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
  const active = hasActiveFilters(filters)

  function openDrawer() {
    dialogRef.current?.showModal()
  }

  function closeDrawer() {
    dialogRef.current?.close()
  }

  function submitSort(event: React.ChangeEvent<HTMLSelectElement>) {
    event.currentTarget.form?.requestSubmit()
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

      <form action={actionPath} method='get'>
        <FilterQueryInputs filters={filters} />
        <label className='font-subheading flex items-center gap-2 text-sm tracking-wide uppercase'>
          <span className='sr-only'>Sort</span>
          <select
            className='cursor-pointer border border-black bg-transparent px-3 py-2'
            defaultValue={sort ?? defaultSortSlug()}
            key={sort ?? defaultSortSlug()}
            name='sort'
            onChange={submitSort}
          >
            {sorting.map((item) => (
              <option key={item.slug ?? 'default'} value={item.slug ?? ''}>
                {item.title}
              </option>
            ))}
          </select>
          <noscript>
            <button className='cursor-pointer underline underline-offset-4' type='submit'>
              Sort
            </button>
          </noscript>
        </label>
      </form>

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

        <form
          action={actionPath}
          className='flex min-h-0 flex-1 flex-col overflow-hidden'
          method='get'
          onSubmit={closeDrawer}
        >
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
            <Link
              className='font-subheading flex-1 cursor-pointer rounded-full border border-black px-4 py-3 text-center text-sm tracking-wide uppercase'
              href={clearFiltersHref(actionPath, sort)}
              onClick={closeDrawer}
            >
              Clear
            </Link>
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

function clearFiltersHref(actionPath: string, sort: string | null) {
  const params = new URLSearchParams()
  if (sort && sort !== defaultSortSlug()) params.set('sort', sort)
  const query = params.toString()
  return query ? `${actionPath}?${query}` : actionPath
}

function FilterQueryInputs({ filters }: { filters: PlpFilters }) {
  return (
    <>
      {filters.color.map((value) => (
        <input key={`color-${value}`} name='color' type='hidden' value={value} />
      ))}
      {filters.era.map((value) => (
        <input key={`era-${value}`} name='era' type='hidden' value={value} />
      ))}
      {filters.size.map((value) => (
        <input key={`size-${value}`} name='size' type='hidden' value={value} />
      ))}
      {filters.type.map((value) => (
        <input key={`type-${value}`} name='type' type='hidden' value={value} />
      ))}
    </>
  )
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
              defaultChecked={selected.includes(color.label)}
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
