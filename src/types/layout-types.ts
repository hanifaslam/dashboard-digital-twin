export interface BreadcrumbItems {
  label: string
  href?: string
}

export interface MenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  children?: MenuItem[]
  middleware?: string[]
}
