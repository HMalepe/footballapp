/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_FOOTBALL_KEY?: string
  readonly VITE_API_FOOTBALL_LEAGUE?: string
  readonly VITE_API_FOOTBALL_TEAM?: string
  readonly VITE_API_FOOTBALL_SEASON?: string
  readonly VITE_API_FOOTBALL_CACHE_MINUTES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
