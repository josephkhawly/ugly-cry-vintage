'use client'

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import Image from 'next/image'
import { Fragment, useEffect, useRef, useState, type MouseEvent } from 'react'
import { HiChevronDown, HiChevronUp, HiOutlineXMark } from 'react-icons/hi2'

import { resolveProductImages } from '@/lib/product-image'
import type { Image as ImageType } from '@/lib/shopify/types'

interface ImageGalleryProps {
  images: ImageType[]
}

interface ThumbnailStripProps {
  images: ImageType[]
  onSelect: (index: number) => void
  selectedIndex: number
}

interface ImageLightboxProps {
  images: ImageType[]
  isOpen: boolean
  onClose: () => void
  onSelect: (index: number) => void
  selectedIndex: number
}

const ZOOM_SCALE = 2.5

export function ImageGallery({ images }: ImageGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const galleryImages = resolveProductImages(images)

  const selectedImage = galleryImages[selectedIndex]

  return (
    <div className='w-full min-w-0'>
      <div className='flex gap-3 md:gap-4'>
        {galleryImages.length > 1 ? (
          <ThumbnailStrip
            images={galleryImages}
            onSelect={setSelectedIndex}
            selectedIndex={selectedIndex}
          />
        ) : null}

        <button
          aria-label='Open larger product image'
          className='relative aspect-[4/5] min-w-0 flex-1 cursor-zoom-in'
          onClick={() => setIsLightboxOpen(true)}
          type='button'
        >
          <Image
            alt={selectedImage.altText}
            className='object-contain'
            fill
            priority
            sizes='(max-width: 1023px) 100vw, 50vw'
            src={selectedImage.url}
          />
        </button>
      </div>

      <ImageLightbox
        images={galleryImages}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onSelect={setSelectedIndex}
        selectedIndex={selectedIndex}
      />
    </div>
  )
}

function ThumbnailStrip({ images, onSelect, selectedIndex }: ThumbnailStripProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-selected=true]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedIndex])

  function step(direction: -1 | 1) {
    onSelect((selectedIndex + direction + images.length) % images.length)
  }

  return (
    <div className='flex w-16 shrink-0 flex-col items-center gap-1 sm:w-20'>
      <button
        aria-label='Previous image'
        className='text-espresso cursor-pointer p-1.5'
        onClick={() => step(-1)}
        type='button'
      >
        <HiChevronUp className='size-6' />
      </button>

      <div
        className='flex max-h-80 w-full [scrollbar-width:none] flex-col gap-2 overflow-y-auto overscroll-contain sm:max-h-96 [&::-webkit-scrollbar]:hidden'
        ref={listRef}
      >
        {images.map((image, index) => (
          <button
            aria-current={index === selectedIndex ? 'true' : undefined}
            aria-label={`View product image ${index + 1}`}
            className='data-[selected=true]:border-espresso w-full shrink-0 cursor-pointer border border-transparent p-0'
            data-selected={index === selectedIndex}
            key={`${image.url}-${index}`}
            onClick={() => onSelect(index)}
            type='button'
          >
            <Image
              alt={image.altText}
              className='h-auto w-full'
              height={image.height}
              sizes='80px'
              src={image.url}
              width={image.width}
            />
          </button>
        ))}
      </div>

      <button
        aria-label='Next image'
        className='text-espresso cursor-pointer p-1.5'
        onClick={() => step(1)}
        type='button'
      >
        <HiChevronDown className='size-6' />
      </button>
    </div>
  )
}

function ImageLightbox({ images, isOpen, onClose, onSelect, selectedIndex }: ImageLightboxProps) {
  const selectedImage = images[selectedIndex]

  return (
    <Transition show={isOpen}>
      <Dialog className='relative z-50' onClose={onClose}>
        <div className='fixed inset-0'>
          <TransitionChild
            as={Fragment}
            enter='ease-out duration-200'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-150'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <DialogPanel className='relative flex size-full flex-col bg-white'>
              <button
                aria-label='Close image gallery'
                className='text-espresso absolute top-3 right-3 z-10 cursor-pointer p-2 hover:opacity-70 md:top-5 md:right-5'
                onClick={onClose}
                type='button'
              >
                <HiOutlineXMark className='size-8' />
              </button>

              <div className='flex size-full gap-3 p-4 pt-14 md:gap-6 md:p-8 md:pt-16'>
                {images.length > 1 ? (
                  <ThumbnailStrip
                    images={images}
                    onSelect={onSelect}
                    selectedIndex={selectedIndex}
                  />
                ) : null}

                <div className='relative min-h-0 min-w-0 flex-1'>
                  <ZoomableImage image={selectedImage} key={selectedImage.url} />
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

function ZoomableImage({ image }: { image: ImageType }) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  function updateOrigin(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    setOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <button
      aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
      className='relative size-full cursor-zoom-in overflow-hidden data-[zoomed=true]:cursor-zoom-out'
      data-zoomed={isZoomed}
      onClick={(event) => {
        updateOrigin(event)
        setIsZoomed((zoomed) => !zoomed)
      }}
      onMouseMove={(event) => {
        if (isZoomed) updateOrigin(event)
      }}
      type='button'
    >
      <Image
        alt={image.altText}
        className='pointer-events-none object-contain transition-transform duration-200 ease-out'
        fill
        sizes='100vw'
        src={image.url}
        style={{
          transform: isZoomed ? `scale(${ZOOM_SCALE})` : 'scale(1)',
          transformOrigin: `${origin.x}% ${origin.y}%`,
        }}
      />
    </button>
  )
}
