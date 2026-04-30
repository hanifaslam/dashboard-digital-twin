export function buildFormData(
  payload: Record<string, unknown> | undefined,
  fileFields: string[],
  options?: { skipNonFileForFiles?: boolean; valueFields?: string[] }
) {
  const fd = new FormData()
  const data = payload || {}
  const valueFields = options?.valueFields || []

  function appendFormData(
    formData: FormData,
    key: string,
    value: unknown,
    parentKey?: string
  ) {
    const fullKey = parentKey ? `${parentKey}[${key}]` : key

    if (value === undefined || value === null) return

    // Handle file fields
    if (fileFields.includes(key) || fileFields.includes(fullKey)) {
      if (value instanceof File) {
        formData.append(fullKey, value)
      } else {
        if (!options?.skipNonFileForFiles) {
          formData.append(fullKey, String(value))
        }
      }
      return
    }

    // Handle arrays
    if (Array.isArray(value)) {
      const isValueField = valueFields.includes(key)

      value.forEach((item, index) => {
        if (
          typeof item === 'object' &&
          item !== null &&
          !(item instanceof File)
        ) {
          const itemRecord = item as Record<string, unknown>

          if (isValueField && 'value' in itemRecord) {
            formData.append(`${fullKey}[${index}]`, String(itemRecord.value))

            Object.keys(itemRecord).forEach((subKey) => {
              if (subKey !== 'value') {
                appendFormData(
                  formData,
                  subKey,
                  itemRecord[subKey],
                  `${fullKey}[${index}]`
                )
              }
            })
          } else {
            Object.keys(itemRecord).forEach((subKey) => {
              appendFormData(
                formData,
                subKey,
                itemRecord[subKey],
                `${fullKey}[${index}]`
              )
            })
          }
        } else {
          formData.append(`${fullKey}[${index}]`, String(item))
        }
      })
      return
    }

    // Handle objects
    if (typeof value === 'object' && !(value instanceof File)) {
      Object.keys(value as Record<string, unknown>).forEach((subKey) => {
        appendFormData(
          formData,
          subKey,
          (value as Record<string, unknown>)[subKey],
          fullKey
        )
      })
      return
    }

    // Handle primitive values
    formData.append(fullKey, String(value))
  }

  for (const key of Object.keys(data)) {
    appendFormData(fd, key, data[key])
  }

  return fd
}
