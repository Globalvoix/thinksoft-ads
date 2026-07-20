import { useEffect, useState } from 'react'
import type { Campaign } from '../../types'
import { apiFetch } from '../../lib/api'

const Toggle = ({ active, onClick }: { active: boolean; onClick?: () => void }) => {
  return (
    <div onClick={onClick} className={`relative inline-flex h-[14px] w-[26px] items-center rounded-full transition-colors cursor-pointer ${active ? 'bg-black' : 'bg-[#e0e0e0]'}`}>
      <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${active ? 'translate-x-[14px]' : 'translate-x-[2px] shadow-sm'}`} />
    </div>
  )
}

export default function CampaignTable() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const fetchCampaigns = async () => {
    try {
      const data = await apiFetch<Campaign[]>('/api/campaigns')
      setCampaigns(data)
    } catch {
      // silently fail
    }
  }

  const toggleCampaign = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Serving' ? 'Paused' : 'Serving'
    try {
      await apiFetch(`/api/campaigns/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    fetchCampaigns()
    const interval = setInterval(fetchCampaigns, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1100px]">
        <thead>
          <tr className="border-b border-gray-200 bg-white">
            <th className="py-[14px] pl-6 pr-3 w-[40px]">
              <div className="w-3.5 h-3.5 border border-gray-300 rounded-[3px] bg-white"></div>
            </th>
            <th className="py-[14px] px-3 text-[12px] font-medium text-gray-500 w-[60px]">Active</th>
            <th className="py-[14px] px-3 text-[12px] font-medium text-gray-500 w-[300px]">Name</th>
            <th className="py-[14px] px-3 text-[12px] font-medium text-gray-500 w-[140px]">Status</th>
            <th className="py-[14px] px-3 text-[12px] font-medium text-gray-500 w-[100px]">Type</th>
            <th className="py-[14px] px-3 text-[12px] font-medium text-gray-500 w-[80px]">Actions</th>
            <th className="py-[14px] px-3 text-[12px] font-medium text-gray-500 text-right">Impressions</th>
            <th className="py-[14px] px-3 text-[12px] font-medium text-gray-500 text-right">Clicks</th>
            <th className="py-[14px] px-3 text-[12px] font-medium text-gray-500 text-right">Spend</th>
            <th className="py-[14px] px-3 text-[12px] font-medium text-gray-500 text-right">CTR</th>
            <th className="py-[14px] pl-3 pr-6 text-[12px] font-medium text-gray-500 text-right">Avg CPC</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.length === 0 && (
            <tr>
              <td colSpan={11} className="py-12 text-center text-sm text-gray-500">
                No campaigns yet. Click Create to get started.
              </td>
            </tr>
          )}
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50/40 transition-colors bg-white group">
              <td className="py-5 pl-6 pr-3">
                <div className="w-3.5 h-3.5 border border-gray-300 rounded-[3px] bg-white group-hover:border-gray-400 transition-colors"></div>
              </td>
              <td className="py-5 px-3">
                <Toggle active={campaign.status === 'Serving'} onClick={() => toggleCampaign(campaign.id, campaign.status)} />
              </td>
              <td className="py-5 px-3 text-[13px] text-gray-900 font-medium">
                {campaign.name}
              </td>
              <td className="py-5 px-3 text-[13px] text-gray-600">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${campaign.status === 'Serving' ? 'bg-[#1ea961]' : 'bg-[#d93025]'}`}></span>
                  {campaign.status}
                </div>
              </td>
              <td className="py-5 px-3 text-[13px] text-gray-600">
                {campaign.objective || 'Clicks'}
              </td>
              <td className="py-5 px-3">
              </td>
              <td className="py-5 px-3 text-[13px] text-gray-600 text-right">
                {campaign.impression_count?.toLocaleString() || 0}
              </td>
              <td className="py-5 px-3 text-[13px] text-gray-600 text-right">
                {campaign.click_count || 0}
              </td>
              <td className="py-5 px-3 text-[13px] text-gray-600 text-right">
                {campaign.conversions === null ? '-' : campaign.conversions}
              </td>
              <td className="py-5 px-3 text-[13px] text-gray-600 text-right">
                ${Number(campaign.budget_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="py-5 px-3 text-[13px] text-gray-600 text-right">
                {campaign.impression_count > 0 && campaign.click_count > 0
                  ? `${((campaign.click_count / campaign.impression_count) * 100).toFixed(2)}%`
                  : '0.00%'}
              </td>
              <td className="py-5 pl-3 pr-6 text-[13px] text-gray-600 text-right">
                ${Number(campaign.budget_amount || 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
