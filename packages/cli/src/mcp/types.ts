export interface RegistryItem {
  name: string
  type: string
  title?: string
  description?: string
  author?: string
  categories?: string[]
  dependencies?: string[]
  registryDependencies?: string[]
  meta?: {
    example?: string
    lineage?: Array<{ name: string; href?: string }>
  }
  cssVars?: {
    theme?: Record<string, string>
    light?: Record<string, string>
    dark?: Record<string, string>
  }
  files?: Array<{
    path: string
    type: string
    target: string
  }>
}

export interface Registry {
  items: RegistryItem[]
}
