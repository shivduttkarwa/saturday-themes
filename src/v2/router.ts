/*
 * Tiny query-param router for the V2 multi-page experience.
 * Pages live on `?p=` so the site stays deployable as a static bundle without
 * server-side rewrite rules.
 */

export type PageKey = 'home' | 'about' | 'services' | 'work' | 'contact'

export const PAGE_LABELS: Record<PageKey, string> = {
  home: 'Saturday®',
  about: 'The Studio',
  services: 'Services',
  work: 'Recent Work',
  contact: 'Contact',
}

const VALID: PageKey[] = ['home', 'about', 'services', 'work', 'contact']

export function readPage(): PageKey {
  const p = new URLSearchParams(window.location.search).get('p')
  return VALID.includes(p as PageKey) ? (p as PageKey) : 'home'
}

export function writePage(page: PageKey) {
  const url = new URL(window.location.href)
  if (page === 'home') url.searchParams.delete('p')
  else url.searchParams.set('p', page)
  window.history.pushState({ page }, '', url)
}

/* fired by nav / footer / in-page CTAs; V2 listens and runs the curtain */
export function requestPage(page: PageKey) {
  window.dispatchEvent(new CustomEvent<PageKey>('v2:navigate', { detail: page }))
}
