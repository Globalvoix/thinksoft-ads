export interface Campaign {
  id: string
  name: string
  active: boolean
  status: string
  type: string
  impressions: number
  clicks: number
  conversions: number | null
  spend: number
  ctr: number
  avgCpc: number
  objective: string
  location: string
  budget_type: string
  budget_amount: number
  start_at: string
  end_at: string | null
  connector_type: string
  connector_category: string
  selected_connectors: string[]
  impression_count: number
  click_count: number
  total_events: number
}
