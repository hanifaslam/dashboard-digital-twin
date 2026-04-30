'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

export interface ImageLoaderProps extends ImageProps {
  skeletonClassName?: string
}

export function ImageLoader({
  className,
  skeletonClassName,
  alt,
  onLoad,
  ...props
}: ImageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <>
      {isLoading && (
        <Skeleton className={cn('absolute inset-0 z-10', skeletonClassName)} />
      )}
      <Image
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={(e) => {
          setIsLoading(false)
          onLoad?.(e)
        }}
        {...props}
      />
    </>
  )
}
