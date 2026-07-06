document.addEventListener('DOMContentLoaded', () => {
  const siteDesc = document.getElementById('site-desc')
  const impressionsEl = document.getElementById('impressions')
  const clicksEl = document.getElementById('clicks')

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]
    if (!tab || !tab.url) return

    const host = new URL(tab.url).hostname

    if (host === 'claude.ai' || host === 'code.claude.com') {
      siteDesc.textContent = 'Showing Thinksoft ads on Claude Code web.'
    } else if (host === 'lovable.dev' || host.endsWith('.lovable.dev')) {
      siteDesc.textContent = 'Showing Thinksoft ads on Lovable.'
    } else if (host === 'replit.com' || host.endsWith('.replit.com')) {
      siteDesc.textContent = 'Showing Thinksoft ads on Replit.'
    } else {
      siteDesc.textContent = 'Thinksoft extension is active.'
    }
  })
})
