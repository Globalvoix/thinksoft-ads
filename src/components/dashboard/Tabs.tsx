import { Filter, Columns, MoreHorizontal, Calendar, ChevronDown } from 'lucide-react'

export default function Tabs() {
  return (
    <div className="flex items-center justify-between px-4 pt-2 border-b border-gray-200">
      <div className="flex space-x-4 text-xs">
        <button className="pb-2 font-medium text-gray-900 border-b-2 border-black">
          Campaigns
        </button>
        <button className="pb-2 font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Ad groups
        </button>
        <button className="pb-2 font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Ads
        </button>
        <button className="pb-2 font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Products
        </button>
      </div>

      <div className="flex items-center gap-2 pb-1.5">
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
          <Filter className="w-3.5 h-3.5" />
        </button>
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
          <Columns className="w-3.5 h-3.5" />
        </button>
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        <div className="h-3 w-px bg-gray-200 mx-1"></div>

        <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium px-1.5 py-1 rounded transition-colors">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          05/15/26 - 05/28/26
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
