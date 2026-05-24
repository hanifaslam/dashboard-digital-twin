'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { SearchIcon, X } from 'lucide-react'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface SearchInputProps {
  placeholder?: string
  onSearch: (searchTerm: string) => void
  onChange?: (value: string) => void
  className?: string
  value?: string
}

export default function SearchInput({
  placeholder,
  onSearch,
  onChange,
  className,
  value
}: SearchInputProps) {
  const resolvedPlaceholder = placeholder ?? 'Search...'
  const [searchInput, setSearchInput] = useState(value || '')

  const debouncedSearch = useDebouncedCallback((val: string) => {
    onSearch(val)
  }, 500)

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchInput)
      debouncedSearch.cancel()
    }
  }

  const handleClear = () => {
    setSearchInput('')
    onSearch('')
    debouncedSearch.cancel()
  }

  return (
    <div className={cn('relative max-w-md', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="text-muted-foreground h-4 w-4" aria-hidden />
      </div>

      <Input
        placeholder={resolvedPlaceholder}
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value)
          debouncedSearch(e.target.value)
          if (onChange) onChange(e.target.value)
        }}
        onKeyDown={handleSearch}
        className="w-full pr-10 pl-9 text-sm"
      />

      {searchInput && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-2"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
