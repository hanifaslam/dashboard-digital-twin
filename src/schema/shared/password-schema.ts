import { z } from 'zod'

export const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/

export const createPasswordSchema = () =>
  z
    .string({ message: 'Kata sandi wajib diisi' })
    .min(8, { message: 'Kata sandi minimal 8 karakter' })
    .regex(passwordRegex, {
      message:
        'Kata sandi harus mengandung huruf besar, huruf kecil, angka, dan simbol'
    })

export const PasswordSchema = createPasswordSchema()

export type Password = z.infer<typeof PasswordSchema>
