import { Search, Plus } from 'lucide-react'

interface HeaderProps {
  onCreateClick?: () => void
}

export default function Header({ onCreateClick }: HeaderProps) {
  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <h1 className="text-[16px] font-normal text-gray-900">Campaigns</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-50">
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={onCreateClick}
          className="bg-[#111111] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium hover:bg-black transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Create
        </button>
      </div>
    </div>
  )
}
