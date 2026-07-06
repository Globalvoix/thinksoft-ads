import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import sql from './db.js'

let clerkMiddleware: any = null
try {
  const clerkMod = await import('@clerk/backend')
  if (process.env.CLERK_SECRET_KEY) {
    clerkMiddleware = clerkMod.ClerkExpressRequireAuth()
    console.log('[Thinksoft API] Clerk auth enabled')
  }
} catch {
  console.log('[Thinksoft API] Clerk not available — using dev placeholder')
}

// --- Lemon Squeezy config ---
const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY || ''
const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || ''
const LS_VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_ID || ''
const hasLemonSqueezy = !!(LS_API_KEY && LS_STORE_ID && LS_VARIANT_ID)
if (hasLemonSqueezy) console.log('[Thinksoft API] Lemon Squeezy enabled')
else console.log('[Thinksoft API] Lemon Squeezy not configured — campaigns will skip payment')

async function createLsCheckout(amountCents: number, campaignId: string, userId: string, name: string): Promise<string | null> {
  if (!hasLemonSqueezy) return null
  try {
    const resp = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LS_API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              custom_price: amountCents,
              product_options: { name: `Thinksoft: ${name}`, description: 'Advertising campaign budget' },
              checkout_options: {
                embed: false,
                redirect_url: `${process.env.VITE_API_BASE_URL || 'http://localhost:5173'}/dashboard?payment=success&campaign=${campaignId}`,
              },
            },
            custom: { campaign_id: campaignId, user_id: userId },
          },
          relationships: {
            store: { data: { type: 'stores', id: LS_STORE_ID } },
            variant: { data: { type: 'variants', id: LS_VARIANT_ID } },
          },
        },
      }),
    })
    if (!resp.ok) { const body = await resp.text(); console.error('[LS] Checkout error:', resp.status, body.slice(0, 200)); return null }
    const body = await resp.json()
    return body?.data?.attributes?.url || null
  } catch (e) {
    console.error('[LS] Checkout exception:', (e as Error).message)
    return null
  }
}

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: true }))
app.use(express.json({ limit: '10mb' }))

function uid() {
  return crypto.randomUUID()
}

function now() {
  return new Date().toISOString()
}

function requireAuth(req: any, res: any, next: any) {
  if (clerkMiddleware) {
    return clerkMiddleware(req, res, next)
  }
  req.auth = { userId: 'dev_placeholder' }
  next()
}

// --- Schema auto-init ---
async function initSchema() {
  // Drop old tables if they exist with wrong schema
  try { await sql`DROP TABLE IF EXISTS ad_events CASCADE` } catch {}
  try { await sql`DROP TABLE IF EXISTS ad_keywords CASCADE` } catch {}
  try { await sql`DROP TABLE IF EXISTS ads CASCADE` } catch {}
  try { await sql`DROP TABLE IF EXISTS campaigns CASCADE` } catch {}

  try {
    await sql`CREATE TABLE campaigns (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      objective TEXT NOT NULL DEFAULT 'Clicks',
      location TEXT NOT NULL DEFAULT 'All',
      budget_type TEXT NOT NULL DEFAULT 'Daily budget',
      budget_amount NUMERIC NOT NULL DEFAULT 25.00,
      start_at TIMESTAMPTZ NOT NULL,
      end_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'Serving',
      connector_type TEXT NOT NULL,
      connector_category TEXT NOT NULL,
      selected_connectors TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  } catch (e) { console.error('[DB] campaigns:', (e as Error).message.slice(0, 100)) }

  try {
    await sql`CREATE TABLE ads (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      ad_group_name TEXT NOT NULL DEFAULT '',
      max_cpc_bid NUMERIC NOT NULL DEFAULT 0,
      destination_url TEXT NOT NULL DEFAULT '',
      display_url TEXT NOT NULL DEFAULT '',
      context_hints TEXT NOT NULL DEFAULT '',
      targeted_keywords TEXT NOT NULL DEFAULT '',
      headline TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      cta TEXT NOT NULL DEFAULT 'Learn more',
      logo_url TEXT NOT NULL DEFAULT '',
      banner_url TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  } catch (e) { console.error('[DB] ads:', (e as Error).message.slice(0, 100)) }

  try {
    await sql`CREATE TABLE ad_keywords (
      id TEXT PRIMARY KEY,
      ad_id TEXT NOT NULL,
      keyword TEXT NOT NULL
    )`
  } catch (e) { console.error('[DB] ad_keywords:', (e as Error).message.slice(0, 100)) }

  try {
    await sql`CREATE TABLE ad_events (
      id TEXT PRIMARY KEY,
      ad_id TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
      search_query TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  } catch (e) { console.error('[DB] ad_events:', (e as Error).message.slice(0, 100)) }

  // Add FK constraints and indexes (may fail if already exist, that's ok)
  try { await sql`ALTER TABLE ads ADD CONSTRAINT fk_ads_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE` } catch {}
  try { await sql`ALTER TABLE ad_keywords ADD CONSTRAINT fk_keywords_ad FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE` } catch {}
  try { await sql`ALTER TABLE ad_events ADD CONSTRAINT fk_events_ad FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE` } catch {}
  try { await sql`CREATE INDEX IF NOT EXISTS idx_ads_campaign_id ON ads(campaign_id)` } catch {}
  try { await sql`CREATE INDEX IF NOT EXISTS idx_ad_keywords_ad_id ON ad_keywords(ad_id)` } catch {}
  try { await sql`CREATE INDEX IF NOT EXISTS idx_ad_keywords_keyword ON ad_keywords(keyword)` } catch {}
  try { await sql`CREATE INDEX IF NOT EXISTS idx_ad_events_ad_id ON ad_events(ad_id)` } catch {}

  console.log('[DB] Schema initialized')
}

// --- Campaigns ---

// GET /api/campaigns
app.get('/api/campaigns', requireAuth, async (req, res) => {
  const userId = req.auth?.userId
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const rows = await sql`SELECT * FROM campaigns WHERE user_id = ${userId} ORDER BY created_at DESC`
  res.json(rows)
})

// POST /api/campaigns
app.post('/api/campaigns', requireAuth, async (req, res) => {
  const userId = req.auth?.userId
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const {
    name, objective, location, budgetType, budgetAmount,
    startDate, endDate, connectorType, connectorCategory, selectedConnectors,
    adGroupName, maxCpcBid, destinationUrl, displayUrl, contextHints, targetedKeywords,
    headline, description, cta, logoUrl, bannerUrl
  } = req.body

  const campaignId = uid()
  const adId = uid()

  const initialStatus = hasLemonSqueezy ? 'Pending Payment' : 'Serving'

  // Create campaign
  await sql`
    INSERT INTO campaigns (id, user_id, name, objective, location, budget_type, budget_amount, start_at, end_at, status, connector_type, connector_category, selected_connectors)
    VALUES (${campaignId}, ${userId}, ${name || 'Untitled'}, ${objective || 'Clicks'}, ${location || 'All'}, ${budgetType || 'Daily budget'}, ${budgetAmount || 25}, ${startDate || now()}, ${endDate || null}, ${initialStatus}, ${connectorType || 'Chrome extension'}, ${connectorCategory || 'Web browsers & search engines'}, ${selectedConnectors || []})
  `

  // Create ad
  await sql`
    INSERT INTO ads (id, campaign_id, ad_group_name, max_cpc_bid, destination_url, display_url, context_hints, targeted_keywords, headline, description, cta, logo_url, banner_url)
    VALUES (${adId}, ${campaignId}, ${adGroupName || ''}, ${maxCpcBid || 0}, ${destinationUrl || ''}, ${displayUrl || ''}, ${contextHints || ''}, ${targetedKeywords || ''}, ${headline || ''}, ${description || ''}, ${cta || 'Learn more'}, ${logoUrl || ''}, ${bannerUrl || ''})
  `

  // Save keywords for search matching — use targetedKeywords (browser) or contextHints (chatbot)
  let kwSource = connectorCategory === 'Web browsers' ? targetedKeywords : contextHints
  // If the primary source is empty, fall back to the other field
  if (!kwSource) kwSource = connectorCategory === 'Web browsers' ? contextHints : targetedKeywords
  const keywords = (kwSource || '')
    .split(/[\n,]+/)
    .map((k: string) => k.trim().toLowerCase())
    .filter((k: string) => k.length > 0)

  for (const keyword of keywords) {
    await sql`
      INSERT INTO ad_keywords (id, ad_id, keyword)
      VALUES (${uid()}, ${adId}, ${keyword})
    `
  }

  // Calculate total charge
  const baseAmount = parseFloat(budgetAmount) || 25
  let totalAmount = baseAmount
  if (budgetType === 'Daily budget' && startDate && endDate) {
    const days = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    totalAmount = baseAmount * days
  }
  const amountCents = Math.round(totalAmount * 100)
  const checkoutUrl = await createLsCheckout(amountCents, campaignId, userId, name || 'Untitled')

  res.json({ campaignId, adId, checkoutUrl })
})

// --- Smart ad serving endpoint (ranked + weighted random) ---

// GET /api/ads/serve?connector=Chrome&query=best+laptops&pageUrl=...&limit=4&exclude=id1,id2
app.get('/api/ads/serve', async (req, res) => {
  const connector = req.query.connector as string
  const query = (req.query.query as string) || ''
  const pageUrl = (req.query.pageUrl as string) || ''
  const limit = Math.min(parseInt(req.query.limit as string) || 4, 20)
  const excludeArr = ((req.query.exclude as string) || '').split(',').filter(Boolean)

  if (!connector) return res.json({ ok: false, data: [] })

  let rows = await sql`
    SELECT a.*, c.name AS campaign_name, c.objective, c.budget_amount,
           c.selected_connectors, c.connector_category, c.connector_type
    FROM ads a
    JOIN campaigns c ON c.id = a.campaign_id
    WHERE c.status = 'Serving'
      AND c.start_at <= NOW()
      AND (c.end_at IS NULL OR c.end_at >= NOW())
      AND c.connector_type = ${connector}
    ORDER BY RANDOM()
    LIMIT ${limit * 5}
  `

  if (excludeArr.length) {
    rows = rows.filter((a: any) => !excludeArr.includes(a.id))
  }

  if (!rows.length) return res.json({ ok: true, data: [] })

  const queryLower = query.toLowerCase()

  const scored = rows.map((ad: any) => {
    let score = 0

    // 1. Bid × Budget (50%)
    const bid = parseFloat(ad.max_cpc_bid) || 0
    const budget = parseFloat(ad.budget_amount) || 0
    score += (bid * budget) * 0.5

    // 2. Keyword match against search query (30%)
    let kwScore = 0
    const keywords = (ad.targeted_keywords || '')
      .split(/[\n,]+/).map((k: string) => k.trim().toLowerCase()).filter(Boolean)
    if (queryLower && keywords.length) {
      const matches = keywords.filter(kw => queryLower.includes(kw)).length
      kwScore = matches / keywords.length
    }
    score += kwScore * 0.3

    // 3. Context hint match against page URL (10%)
    let ctxScore = 0
    const urlLower = pageUrl.toLowerCase()
    const hints = (ad.context_hints || '')
      .split(/[\n,]+/).map((h: string) => h.trim().toLowerCase()).filter(Boolean)
    if (urlLower && hints.length) {
      const matches = hints.filter(h => urlLower.includes(h)).length
      ctxScore = matches / hints.length
    }
    score += ctxScore * 0.1

    // 4. Freshness (10%) — decays over 30 days
    const ageMs = Date.now() - new Date(ad.created_at).getTime()
    const daysOld = ageMs / (1000 * 60 * 60 * 24)
    score += Math.max(0, 1 - daysOld / 30) * 0.1

    return { ...ad, score }
  })

  scored.sort((a: any, b: any) => b.score - a.score)

  // For limit=1 (chat/dev): weighted random from top 5
  if (limit === 1 && scored.length > 1) {
    const candidates = scored.slice(0, Math.min(5, scored.length))
    const totalScore = candidates.reduce((sum: number, a: any) => sum + Math.max(a.score, 0.01), 0)
    let r = Math.random() * totalScore
    for (const ad of candidates) {
      r -= Math.max(ad.score, 0.01)
      if (r <= 0) return res.json({ ok: true, data: [ad] })
    }
  }

  return res.json({ ok: true, data: scored.slice(0, limit) })
})

// --- Ads search (for Chrome extension targeting Claude Code, Lovable, Replit) ---

// GET /api/ads/search?q=keyword
app.get('/api/ads/search', async (req, res) => {
  const query = ((req.query.q as string) || '').trim().toLowerCase()
  if (!query) return res.json([])

  const rows = await sql`
    SELECT DISTINCT a.*, c.name AS campaign_name, c.objective, c.budget_amount, c.selected_connectors, c.connector_category
    FROM ads a
    JOIN campaigns c ON c.id = a.campaign_id
    JOIN ad_keywords k ON k.ad_id = a.id
    WHERE c.status = 'Serving'
      AND c.start_at <= NOW()
      AND (c.end_at IS NULL OR c.end_at >= NOW())
      AND (
        ${query} LIKE '%' || k.keyword || '%'
        OR k.keyword LIKE '%' || ${query} || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(string_to_array(${query}, ' ')) AS qw
          WHERE length(qw) > 3
            AND (qw LIKE '%' || k.keyword || '%' OR k.keyword LIKE '%' || qw || '%')
        )
        OR (
          c.connector_category = 'AI chatbots'
          AND (
            a.context_hints ILIKE '%' || ${query} || '%'
            OR EXISTS (
              SELECT 1 FROM unnest(string_to_array(a.context_hints, ' ')) AS cw
              WHERE length(cw) > 3 AND ${query} ILIKE '%' || cw || '%'
            )
          )
        )
      )
    LIMIT 3
  `

  res.json(rows)
})

// GET /api/ads/active/all — all active serving ads (no keyword filtering, for Chrome extension)
// Optional ?connector=Chrome filters by campaign connector type
app.get('/api/ads/active/all', async (req, res) => {
  const connector = (req.query.connector as string) || ''
  const rows = connector
    ? await sql`
        SELECT a.*, c.name AS campaign_name, c.objective, c.budget_amount, c.selected_connectors, c.connector_category, c.connector_type
        FROM ads a
        JOIN campaigns c ON c.id = a.campaign_id
        WHERE c.status = 'Serving'
          AND c.start_at <= NOW()
          AND (c.end_at IS NULL OR c.end_at >= NOW())
          AND c.connector_type = ${connector}
        ORDER BY c.budget_amount * a.max_cpc_bid DESC
        LIMIT 20
      `
    : await sql`
        SELECT a.*, c.name AS campaign_name, c.objective, c.budget_amount, c.selected_connectors, c.connector_category, c.connector_type
        FROM ads a
        JOIN campaigns c ON c.id = a.campaign_id
        WHERE c.status = 'Serving'
          AND c.start_at <= NOW()
          AND (c.end_at IS NULL OR c.end_at >= NOW())
        ORDER BY c.budget_amount * a.max_cpc_bid DESC
        LIMIT 20
      `
  res.json(rows)
})

// --- Plugin API (for Claude Code CLI plugin) ---

// GET /api/ads/active?campaign_id=x
app.get('/api/ads/active', async (req, res) => {
  const campaignId = (req.query.campaign_id as string) || ''
  const rows = campaignId
    ? await sql`
        SELECT a.*, c.name AS campaign_name
        FROM ads a
        JOIN campaigns c ON c.id = a.campaign_id
        WHERE c.status = 'Serving'
          AND c.start_at <= NOW()
          AND (c.end_at IS NULL OR c.end_at >= NOW())
          AND c.id = ${campaignId}
        ORDER BY RANDOM()
        LIMIT 1
      `
    : await sql`
        SELECT a.*, c.name AS campaign_name
        FROM ads a
        JOIN campaigns c ON c.id = a.campaign_id
        WHERE c.status = 'Serving'
          AND c.start_at <= NOW()
          AND (c.end_at IS NULL OR c.end_at >= NOW())
        ORDER BY RANDOM()
        LIMIT 1
      `
  if (rows.length === 0) return res.status(404).json({ error: 'No active ads' })
  res.json(rows[0])
})

// --- Events ---

// POST /api/ads/:id/impression
app.post('/api/ads/:id/impression', async (req, res) => {
  const searchQuery = req.body.query || ''
  await sql`
    INSERT INTO ad_events (id, ad_id, event_type, search_query)
    VALUES (${uid()}, ${req.params.id}, 'impression', ${searchQuery})
  `
  res.json({ ok: true })
})

// POST /api/ads/:id/click
app.post('/api/ads/:id/click', async (req, res) => {
  const searchQuery = req.body.query || ''
  await sql`
    INSERT INTO ad_events (id, ad_id, event_type, search_query)
    VALUES (${uid()}, ${req.params.id}, 'click', ${searchQuery})
  `
  res.json({ ok: true })
})

// --- Lemon Squeezy webhook ---

app.post('/api/webhooks/lemonsqueezy', async (req, res) => {
  const eventName = req.body?.meta?.event_name
  const customData = req.body?.meta?.custom_data || {}
  const campaignId = customData.campaign_id

  if (eventName === 'order_created' && campaignId) {
    const status = req.body?.data?.attributes?.status
    if (status === 'paid') {
      await sql`UPDATE campaigns SET status = 'Serving' WHERE id = ${campaignId} AND status = 'Pending Payment'`
      console.log('[LS] Campaign', campaignId, 'paid — now Serving')
    }
  }

  res.json({ ok: true })
})

// --- Start ---
await initSchema()

app.listen(PORT, () => {
  console.log(`[Thinksoft API] Running on http://localhost:${PORT}`)
})
