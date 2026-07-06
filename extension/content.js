const host = location.hostname
const url = location.href
console.log('[Thinksoft] Script loaded on', host, url)

const SITES = {
  claude: host === 'claude.ai' || host === 'code.claude.com',
  lovable: host === 'lovable.dev' || host.endsWith('.lovable.dev') || host.endsWith('.lovableproject.com'),
  replit: host === 'replit.com' || host.endsWith('.replit.com'),
  chatgpt: host === 'chatgpt.com' || host.endsWith('.chatgpt.com'),
  googleSearch: host === 'www.google.com' || host.endsWith('.google.co.in') || host.endsWith('.google.co.uk') || host.endsWith('.google.ca') || host.endsWith('.google.com.au') || host.endsWith('.google.de') || host.endsWith('.google.fr') || host.endsWith('.google.es') || host.endsWith('.google.it') || host.endsWith('.google.nl') || host.endsWith('.google.br') || host === 'google.com',
  bingSearch: host === 'www.bing.com',
}
const isSearchEngine = (SITES.googleSearch || SITES.bingSearch) && url.includes('/search?q=')

function siteConnector() {
  if (SITES.chatgpt) return 'ChatGPT'
  if (SITES.claude) return 'Claude'
  if (SITES.lovable) return 'Lovable'
  if (SITES.replit) return 'Replit'
  if (isSearchEngine) return 'Chrome Search'
  return 'Chrome'
}

let adPool = []
const shownIds = new Set()

function pickAd() {
  if (!adPool.length) return null
  const weights = adPool.map(a => Math.max(parseFloat(a.max_cpc_bid) || 0.01, 0.01) * Math.max(parseFloat(a.budget_amount) || 1, 0.01))
  const total = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (let i = 0; i < adPool.length; i++) {
    rand -= weights[i]
    if (rand <= 0) {
      const ad = adPool[i]
      adPool.splice(i, 1)
      shownIds.add(ad.id)
      return ad
    }
  }
  const ad = adPool.pop()
  shownIds.add(ad.id)
  return ad
}

function fireImpression(ad) {
  if (!chrome.runtime?.id) return
  chrome.runtime.sendMessage({ type: 'trackEvent', adId: ad.id, eventType: 'impression', query: '' }).catch(() => {})
}

function getSearchQuery() {
  const params = new URLSearchParams(location.search)
  return params.get('q') || ''
}

async function fetchAds(opts = {}) {
  const connector = opts.connector || siteConnector()
  if (!connector) return []
  const params = { type: 'fetchAds', connector, ...opts }
  try {
    const response = await chrome.runtime.sendMessage(params)
    if (response?.ok && response.data?.length) return response.data
  } catch (e) {
    if (e.message?.includes('context invalidated') || e.message?.includes('Extension context')) return []
  }
  return []
}

async function ensurePool(limit = 5) {
  if (adPool.length > 0) return
  const exclude = [...shownIds].join(',')
  const ads = await fetchAds({ limit, exclude })
  adPool = ads || []
}

// --- Spinner text replacement ---

const SPINNER_WORDS = [
  'thinking', 'working', 'generating', 'cooking', 'loading',
  'processing', 'building', 'compiling', 'running', 'analyzing',
  'applying', 'updating', 'preparing', 'installing', 'deploying',
  'creating', 'publishing', 'setting up', 'please wait',
  'just a moment', 'fetching', 'initializing', 'configuring',
  'optimizing', 'refreshing', 'saving', 'rendering',
  'exploring', 'searching', 'finding', 'gathering', 'organizing',
  'evaluating', 'calculating', 'designing', 'drafting', 'reviewing',
  'summarizing', 'translating', 'formatting', 'connecting', 'syncing',
  'downloading', 'uploading', 'executing', 'checking',
  'verifying', 'validating', 'starting', 'launching',
  'grooving', 'composing', 'assembling', 'stitching',
  'importing', 'exporting', 'copying', 'pasting',
  'indexing', 'parsing', 'transforming', 'migrating',
  'publishing', 'submitting', 'registering', 'logging',
]

function replaceSpinnerText(node) {
  const text = node.nodeValue
  if (!text) return false
  const el = node.parentElement
  if (!el || el.closest('[data-ts-replaced]')) return false

  const lower = text.toLowerCase()
  if (!SPINNER_WORDS.some(w => lower.includes(w))) return false

  const ad = pickAd()
  if (!ad) return false

  if (ad.logo_url) {
    const img = document.createElement('img')
    img.src = ad.logo_url
    img.style.cssText = 'width:16px;height:16px;vertical-align:middle;margin-right:4px;display:inline;'
    img.alt = ''
    el.parentElement?.insertBefore(img, el)
  }

  node.nodeValue = ad.headline || 'Sponsored'
  el.setAttribute('data-ts-replaced', '1')
  fireImpression(ad)
  console.log('[Thinksoft] REPLACED:', text.trim(), '->', ad.headline)
  return true
}

function walkTextNodes(root) {
  const iter = document.createNodeIterator(root, NodeFilter.SHOW_TEXT, null, false)
  let node, replaced = 0
  while (node = iter.nextNode()) {
    if (replaceSpinnerText(node)) replaced++
  }
  if (replaced) console.log('[Thinksoft] Replaced', replaced, 'spinner text nodes')
}

// --- Search engine ad replacement ---

function createSearchAdElement(ad) {
  const c = document.createElement('div')
  c.className = 'ts-search-ad'
  c.style.cssText = 'padding:12px 0;border-bottom:1px solid #eee;font-family:arial,sans-serif;'
  const brand = document.createElement('div')
  brand.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:2px;'
  if (ad.logo_url) {
    const img = document.createElement('img')
    img.src = ad.logo_url; img.style.cssText = 'width:18px;height:18px;border-radius:50%;display:inline;'; img.alt = ''
    brand.appendChild(img)
  }
  const urlEl = document.createElement('span')
  urlEl.style.cssText = 'font-size:12px;color:#202124;'
  urlEl.textContent = ad.display_url || (ad.destination_url ? new URL(ad.destination_url).hostname.replace('www.', '') : 'Sponsored')
  brand.appendChild(urlEl)
  const badge = document.createElement('span')
  badge.style.cssText = 'font-size:11px;color:#70757a;margin-left:4px;'
  badge.textContent = 'Ad'
  brand.appendChild(badge)
  c.appendChild(brand)
  const title = document.createElement('a')
  title.href = ad.destination_url || '#'; title.target = '_blank'
  title.style.cssText = 'font-size:14px;font-weight:400;color:#1a0dab;text-decoration:none;display:block;margin:2px 0;cursor:pointer;'
  title.textContent = ad.headline || 'Sponsored'
  c.appendChild(title)
  if (ad.description) {
    const desc = document.createElement('div')
    desc.style.cssText = 'font-size:12px;color:#4d5156;line-height:1.4;'
    desc.textContent = ad.description
    c.appendChild(desc)
  }
  if (ad.destination_url) {
    const u = document.createElement('div')
    u.style.cssText = 'font-size:12px;color:#006621;margin-top:2px;'
    u.textContent = ad.destination_url
    c.appendChild(u)
  }
  return c
}

function createBingSearchAdElement(ad) {
  const c = document.createElement('div')
  c.className = 'ts-search-ad'
  c.style.cssText = 'padding:14px 0;border-bottom:1px solid #e2e2e2;font-family:Segoe UI,arial,sans-serif;'
  const brand = document.createElement('div')
  brand.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:2px;'
  if (ad.logo_url) {
    const img = document.createElement('img')
    img.src = ad.logo_url; img.style.cssText = 'width:16px;height:16px;display:inline;'; img.alt = ''
    brand.appendChild(img)
  }
  const urlEl = document.createElement('div')
  urlEl.style.cssText = 'font-size:12px;color:#565656;'
  urlEl.textContent = ad.destination_url || 'Sponsored'
  brand.appendChild(urlEl)
  const badge = document.createElement('span')
  badge.style.cssText = 'font-size:10px;color:#767676;margin-left:4px;border:1px solid #ccc;padding:0 4px;border-radius:2px;'
  badge.textContent = 'Ad'
  brand.appendChild(badge)
  c.appendChild(brand)
  const title = document.createElement('a')
  title.href = ad.destination_url || '#'; title.target = '_blank'
  title.style.cssText = 'font-size:16px;font-weight:500;color:#1a0dab;text-decoration:none;display:block;margin:2px 0;cursor:pointer;'
  title.textContent = ad.headline || 'Sponsored'
  c.appendChild(title)
  if (ad.description) {
    const desc = document.createElement('div')
    desc.style.cssText = 'font-size:13px;color:#444;line-height:1.4;'
    desc.textContent = ad.description
    c.appendChild(desc)
  }
  return c
}

const GOOGLE_AD_SELECTORS = ['[id^="ad_"]', '[data-text-ad]', '.uEierd', '#taw > div', '#tvcap > div']
const BING_AD_SELECTORS = ['.b_ad', '#ads', '.b_adLast', 'li.b_ad', '[data-ad]']

function replaceSearchAds() {
  let replaced = 0
  const selectors = SITES.googleSearch ? GOOGLE_AD_SELECTORS : BING_AD_SELECTORS
  const createEl = SITES.googleSearch ? createSearchAdElement : createBingSearchAdElement

  for (const sel of selectors) {
    for (const container of document.querySelectorAll(sel)) {
      if (container.closest('.ts-search-ad') || container.hasAttribute('data-ts-replaced')) continue
      const ad = pickAd()
      if (!ad) break
      const adEl = createEl(ad)
      container.parentElement?.insertBefore(adEl, container)
      container.style.display = 'none'
      container.setAttribute('data-ts-replaced', '1')
      fireImpression(ad)
      replaced++
    }
  }

  if (replaced === 0 && SITES.googleSearch) {
    for (const el of document.querySelectorAll('a, span, div')) {
      if (el.closest('.ts-search-ad') || el.hasAttribute('data-ts-replaced')) continue
      if (el.textContent?.trim() !== 'Ad' || el.childElementCount !== 0 || el.closest('[data-text-ad]')) continue
      let parent = el.parentElement
      for (let i = 0; i < 5 && parent; i++) {
        if (parent.querySelectorAll('a').length >= 2 || parent.querySelector('[data-text-ad]')) {
          if (parent.hasAttribute('data-ts-replaced')) break
          const ad = pickAd()
          if (!ad) break
          parent.parentElement?.insertBefore(createEl(ad), parent)
          parent.style.display = 'none'
          parent.setAttribute('data-ts-replaced', '1')
          fireImpression(ad)
          replaced++
          break
        }
        parent = parent.parentElement
      }
    }
  }

  if (replaced) console.log('[Thinksoft] Replaced', replaced, 'search ads')
  return replaced
}

function startSearchAdObserver() {
  console.log('[Thinksoft] Starting search ad observer')
  replaceSearchAds()
  new MutationObserver(() => replaceSearchAds()).observe(document.body, { childList: true, subtree: true })
  setInterval(replaceSearchAds, 3000)
}

// --- ChatGPT ad injection ---

function isPageDark() {
  const bg = getComputedStyle(document.body).backgroundColor
  const m = bg.match(/\d+/g)
  if (m) {
    const [r, g, b] = m.map(Number)
    return r * 0.299 + g * 0.587 + b * 0.114 < 128
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function pillStyles(site) {
  const dark = isPageDark()
  if (site === 'replit' || dark) return {
    container: 'display:inline-flex;align-items:center;gap:10px;padding:7px 14px 7px 9px;margin:10px 0 4px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);width:fit-content;cursor:default;',
    text: 'font-size:13px;font-weight:400;color:rgba(255,255,255,0.85);line-height:1.4;',
    badge: 'font-size:10px;font-weight:500;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.04em;margin-left:4px;',
    hoverBg: 'rgba(255,255,255,0.08)',
    leaveBg: 'rgba(255,255,255,0.04)',
  }
  // ChatGPT-style light pill (used for ChatGPT, Lovable in light mode)
  return {
    container: 'display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;margin:12px 0 4px;border-radius:20px;border:1px solid #e5e5e5;background:#f9f9f9;width:fit-content;cursor:default;',
    text: 'font-size:13px;font-weight:400;color:#2d2d2d;line-height:1.3;',
    badge: 'font-size:10px;font-weight:500;color:#8e8ea0;text-transform:uppercase;letter-spacing:0.02em;margin-left:2px;',
    hoverBg: '#f0f0f0',
    leaveBg: '#f9f9f9',
  }
}

let lastThemeDark = null

function themeChanged() {
  const now = isPageDark()
  if (lastThemeDark !== null && lastThemeDark !== now) {
    document.querySelectorAll('.ts-chat-pill').forEach(el => el.remove())
    document.querySelectorAll('[data-ts-replaced]').forEach(el => el.removeAttribute('data-ts-replaced'))
  }
  lastThemeDark = now
}

function createChatAdPill(ad, site) {
  const s = pillStyles(site)
  const pill = document.createElement('div')
  pill.className = 'ts-chat-pill'
  pill.style.cssText = s.container

  if (ad.logo_url) {
    const img = document.createElement('img')
    img.src = ad.logo_url
    img.style.cssText = 'width:18px;height:18px;border-radius:50%;display:inline;flex-shrink:0;'
    img.alt = ''
    pill.appendChild(img)
  }

  const text = document.createElement('span')
  text.style.cssText = s.text
  text.textContent = ad.headline || 'Sponsored'
  pill.appendChild(text)

  const badge = document.createElement('span')
  badge.style.cssText = s.badge
  badge.textContent = 'Sponsored'
  pill.appendChild(badge)

  if (ad.destination_url) {
    pill.style.cursor = 'pointer'
    pill.addEventListener('click', () => window.open(ad.destination_url, '_blank'))
    pill.addEventListener('mouseenter', () => { pill.style.background = s.hoverBg })
    pill.addEventListener('mouseleave', () => { pill.style.background = s.leaveBg })
  }
  return pill
}

function findAssistantMessages(site) {
  const selectors = site === 'claude'
    ? ['[data-message-author-role="assistant"]', 'article', '[class*="message"][class*="assistant"]', '.assistant-message']
    : ['[data-message-author-role="assistant"]', 'article[data-testid*="message"]', '[data-testid="conversation-turn"]', 'div[role="assistant"]']
  for (const sel of selectors) {
    const found = document.querySelectorAll(sel)
    if (found.length) return found
  }
  return []
}

function findMessageContent(msg) {
  return msg.querySelector('[data-message-content]') || msg.querySelector('.whitespace-pre-wrap') || msg.querySelector('[class*="markdown"]') || msg.lastElementChild
}

function injectChatAds(site) {
  if (!adPool.length) return 0
  let injected = 0
  const pillClass = '.ts-chat-pill'
  for (const msg of findAssistantMessages(site)) {
    if (msg.querySelector(pillClass)) continue
    const ad = pickAd()
    if (!ad) continue
    const pill = createChatAdPill(ad, site)
    const content = findMessageContent(msg)
    if (content?.parentElement) content.parentElement.insertBefore(pill, content.nextSibling)
    else msg.appendChild(pill)
    fireImpression(ad)
    injected++
  }
  if (injected) console.log('[Thinksoft] Injected', injected, 'pills for', site)
  return injected
}

function startChatObserver(site) {
  console.log('[Thinksoft] Starting', site, 'observer')
  const injectFn = () => { themeChanged(); injectChatAds(site) }
  setTimeout(injectFn, 5000)
  new MutationObserver(injectFn).observe(document.body, { childList: true, subtree: true })
  setInterval(injectFn, 4000)
}

// --- Lovable / Replit platform ad injection ---

function findSpinnerContainer(node) {
  let el = node.parentElement
  for (let i = 0; i < 6 && el; i++) {
    const text = (el.textContent || '').trim().toLowerCase()
    const isSmall = el.childElementCount <= 5 && text.length < 150
    const hasNoLinks = !el.querySelector('a, button')
    if (isSmall && hasNoLinks && SPINNER_WORDS.some(w => text.includes(w))) return el
    el = el.parentElement
  }
  return null
}

function injectPlatformAds(site) {
  if (!adPool.length) return 0
  let injected = 0
  const iter = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT, null, false)
  let node
  while (node = iter.nextNode()) {
    const text = node.nodeValue?.toLowerCase()
    if (!text || !SPINNER_WORDS.some(w => text.includes(w))) continue
    const el = node.parentElement
    if (!el || el.closest('.ts-chat-pill') || el.closest('[data-ts-replaced]')) continue

    const container = findSpinnerContainer(node)
    if (!container || container.closest('.ts-chat-pill') || container.hasAttribute('data-ts-replaced')) continue

    const ad = pickAd()
    if (!ad) break

    const pill = createChatAdPill(ad, site)
    container.parentElement?.insertBefore(pill, container)
    container.style.display = 'none'
    container.setAttribute('data-ts-replaced', '1')
    fireImpression(ad)
    injected++
  }
  if (injected) console.log('[Thinksoft] Injected', injected, 'pills for', site)
  return injected
}

function startPlatformObserver(site) {
  console.log('[Thinksoft] Starting platform observer for', site)
  injectPlatformAds(site)
  new MutationObserver(() => injectPlatformAds(site)).observe(document.body, { childList: true, subtree: true })
  setInterval(() => injectPlatformAds(site), 3000)
}

// --- Chrome floating card ---

let chromeCardTimer = null
let chromeCardInterval = null

function createChromeCard(ad) {
  const existing = document.getElementById('ts-chrome-card')
  if (existing) existing.remove()

  const card = document.createElement('div')
  card.id = 'ts-chrome-card'
  card.style.cssText = 'position:fixed;top:16px;right:16px;z-index:2147483647;width:320px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.15);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;transform:translateX(400px);transition:transform 0.4s cubic-bezier(0.16,1,0.3,1);overflow:hidden;'

  if (ad.destination_url) {
    card.style.cursor = 'pointer'
    card.addEventListener('click', e => {
      if (e.target.closest('.ts-card-close')) return
      window.open(ad.destination_url, '_blank')
    })
  }

  const inner = document.createElement('div')
  inner.style.cssText = 'display:flex;align-items:flex-start;gap:12px;padding:14px 16px;'

  if (ad.logo_url) {
    const img = document.createElement('img')
    img.src = ad.logo_url
    img.style.cssText = 'width:36px;height:36px;border-radius:50%;flex-shrink:0;margin-top:2px;'
    img.alt = ''
    inner.appendChild(img)
  }

  const body = document.createElement('div')
  body.style.cssText = 'flex:1;min-width:0;'

  const badge = document.createElement('div')
  badge.style.cssText = 'font-size:10px;font-weight:600;color:#8e8ea0;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:4px;'
  badge.textContent = 'Sponsored'
  body.appendChild(badge)

  const title = document.createElement('div')
  title.style.cssText = 'font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.3;margin-bottom:4px;'
  title.textContent = ad.headline || 'Sponsored'
  body.appendChild(title)

  if (ad.description) {
    const desc = document.createElement('div')
    desc.style.cssText = 'font-size:12px;color:#666;line-height:1.4;'
    desc.textContent = ad.description
    body.appendChild(desc)
  }

  inner.appendChild(body)

  const close = document.createElement('button')
  close.className = 'ts-card-close'
  close.innerHTML = '&times;'
  close.style.cssText = 'position:absolute;top:8px;right:8px;width:24px;height:24px;border:none;background:rgba(0,0,0,0.05);border-radius:50%;font-size:16px;line-height:1;color:#666;cursor:pointer;display:flex;align-items:center;justify-content:center;'
  close.addEventListener('click', e => {
    e.stopPropagation()
    card.style.transform = 'translateX(400px)'
    setTimeout(() => card.remove(), 400)
  })
  card.appendChild(close)

  card.appendChild(inner)
  document.body.appendChild(card)

  requestAnimationFrame(() => { card.style.transform = 'translateX(0)' })

  setTimeout(() => {
    if (document.getElementById('ts-chrome-card')) {
      card.style.transform = 'translateX(400px)'
      setTimeout(() => card.remove(), 400)
    }
  }, 8000)
}

function showChromeCard() {
  if (!adPool.length) return
  const ad = pickAd()
  if (!ad) return
  createChromeCard(ad)
  fireImpression(ad)
}

// --- Init ---

async function init() {
  console.log('[Thinksoft] init() called, readyState:', document.readyState)
  if (!document.body) { setTimeout(init, 500); return }

  const connector = siteConnector()
  console.log('[Thinksoft] Connector:', connector)

  if (isSearchEngine) {
    adPool = await fetchAds({ query: getSearchQuery(), limit: 4 }) || []
    console.log('[Thinksoft] Fetched', adPool.length, 'search ads')
    if (!adPool.length) { console.log('[Thinksoft] No search ads'); return }
    startSearchAdObserver()
  } else if (SITES.chatgpt || SITES.claude || SITES.lovable || SITES.replit) {
    adPool = await fetchAds({ limit: 5 }) || []
    console.log('[Thinksoft] Fetched', adPool.length, 'ads')
    if (!adPool.length) { console.log('[Thinksoft] No ads'); return }
    if (SITES.chatgpt || SITES.claude) {
      startChatObserver(SITES.claude ? 'claude' : 'chatgpt')
    } else {
      startPlatformObserver(SITES.lovable ? 'lovable' : 'replit')
    }
  } else {
    // Chrome connector — floating card every 5 min
    adPool = await fetchAds({ limit: 5 }) || []
    console.log('[Thinksoft] Fetched', adPool.length, 'Chrome card ads')
    if (!adPool.length) { console.log('[Thinksoft] No Chrome ads'); return }
    setTimeout(() => { showChromeCard(); startChromeCardInterval() }, 3000)
    return
  }

  setInterval(async () => {
    if (!adPool.length) {
      const ads = await fetchAds({ limit: 5, exclude: [...shownIds].join(',') })
      if (ads && ads.length) adPool = ads
    }
    if (!adPool.length) return
    themeChanged()
    if (SITES.lovable) injectPlatformAds('lovable')
    else if (SITES.replit) injectPlatformAds('replit')
    else if (isSearchEngine) replaceSearchAds()
    else walkTextNodes(document.body)
  }, 3000)
}

function startChromeCardInterval() {
  chromeCardInterval = setInterval(async () => {
    if (!adPool.length) {
      const ads = await fetchAds({ limit: 5, exclude: [...shownIds].join(',') })
      if (ads && ads.length) adPool = ads
    }
    showChromeCard()
  }, 300000)
}

function startSpinnerObserver() {
  console.log('[Thinksoft] Starting spinner observer')
  try {
    new MutationObserver(muts => {
      for (const m of muts) {
        for (const added of m.addedNodes) {
          if (added.nodeType === 1) walkTextNodes(added)
          else if (added.nodeType === 3) replaceSpinnerText(added)
        }
        if (m.type === 'characterData') replaceSpinnerText(m.target)
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true })
    console.log('[Thinksoft] Observer attached')
  } catch (e) {
    console.error('[Thinksoft] Observer error:', e)
    setTimeout(startSpinnerObserver, 1000)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
