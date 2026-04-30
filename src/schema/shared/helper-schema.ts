import { z } from 'zod'

export const createImageUrlSchema = (trans: (key: string) => string) =>
  z.url().refine(
    (val) => {
      const pathname = (() => {
        try {
          return new URL(val).pathname
        } catch {
          return ''
        }
      })()
      return /\.(png|jpe?g|webp)$/i.test(pathname)
    },
    { message: trans('imageUrlInvalidExtension') }
  )

export const createImageFileSchema = (trans: (key: string) => string) =>
  z.union([
    z
      .instanceof(File, { message: trans('fileMustBeImage') })
      .refine(
        (file) =>
          ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(
            file.type
          ),
        { message: trans('onlyImageFormatsAllowed') }
      )
      .refine((file) => file.size <= 1024 * 1024, {
        message: trans('fileSizeLimit')
      }),
    z.url({ message: trans('invalidImageUrl') })
  ])

export const createPdfSchema = (trans: (key: string) => string) =>
  z.union([
    z
      .instanceof(File, { message: trans('fileMustBePdf') })
      .refine((file) => file.type === 'application/pdf', {
        message: trans('onlyPdfFormatAllowed')
      }),
    z.url({ message: trans('invalidPdfUrl') })
  ])

// Fallback schemas without translation
export const ImageUrlSchema = createImageUrlSchema((key) => key)
export const ImageFileSchema = createImageFileSchema((key) => key)
export const PdfSchema = createPdfSchema((key) => key)
