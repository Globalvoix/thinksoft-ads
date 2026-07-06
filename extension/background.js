const API_BASE = 'http://localhost:4000'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'fetchAds') {
    const params = new URLSearchParams()
    if (message.connector) params.set('connector', message.connector)
    if (message.query) params.set('query', message.query)
    if (message.pageUrl) params.set('pageUrl', message.pageUrl)
    if (message.limit) params.set('limit', String(message.limit))
    if (message.exclude) params.set('exclude', message.exclude)
    fetch(`${API_BASE}/api/ads/serve?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject('Status ' + r.status))
      .then(data => sendResponse({ ok: true, data: data?.data || [] }))
      .catch(err => sendResponse({ ok: false, error: String(err) }))
    return true
  }
  if (message.type === 'trackEvent') {
    fetch(`${API_BASE}/api/ads/${message.adId}/${message.eventType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message.query }),
    }).catch(() => {}).finally(() => sendResponse?.({ ok: true }))
    return true
  }
})
