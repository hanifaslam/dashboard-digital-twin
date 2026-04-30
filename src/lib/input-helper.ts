export function getNormalizedValue(e: unknown, maxLength = 50): string {
  let v = ''
  if (typeof e === 'string') v = e
  else if (e && typeof e === 'object') {
    const obj = e as Record<string, unknown>
    const target = obj.target as Record<string, unknown> | undefined
    if (target && typeof target.value === 'string') v = target.value
    else if (typeof obj.value === 'string') v = obj.value
  }
  if (v.length > maxLength) v = v.slice(0, maxLength)
  return v // e.g. Input: "Hello World" with maxLength 5 will return "Hello"
}

export function trimToMaxLength(
  onChange: (v: string) => void,
  maxLength = 50
): (e: unknown) => void {
  return (e: unknown) => {
    const val = getNormalizedValue(e, maxLength)
    onChange(val)
  }
}

export function numericOnly(value: string): string {
  return value.replace(/[^0-9.-]/g, '')
}
