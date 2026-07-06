import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Bot,
  Check,
  ChevronDown,
  Globe,
  Search,
  Terminal,
  X,
} from 'lucide-react'

interface ConnectorSelectionModalProps {
  isOpen: boolean
  type: 'Chrome extension' | 'MCP' | null
  onClose: () => void
  onFinish: (category: string, connectors: string[]) => void
}

const CHROME_EXTENSION_CONNECTORS = [
  { name: 'Chrome Search', domain: 'google.com/search', fallbackIcon: Globe, category: 'Web browsers', popular: true, description: 'Show ads on Google and Bing search results.' },
  { name: 'Chrome', domain: 'google.com/chrome', fallbackIcon: Globe, category: 'Web browsers', popular: true, description: 'Show native ad cards in Chrome browser.' },
  { name: 'Emergent', domain: 'emergent.sh', fallbackIcon: Terminal, category: 'Development platforms', popular: true, description: 'Show ads within Emergent terminal workflows.' },
  { name: 'ChatGPT', domain: 'chatgpt.com', fallbackIcon: Bot, category: 'AI chatbots', popular: true, description: 'Show ads within ChatGPT conversations.' },
  { name: 'Claude', domain: 'claude.ai', fallbackIcon: Bot, category: 'AI chatbots', popular: true, comingSoon: true, description: 'Show ads within Claude conversations.' },
  { name: 'Claude Code', domain: 'anthropic.com/claude-code', fallbackIcon: Terminal, category: 'Development platforms', popular: true, comingSoon: true, description: 'Show ads on Claude Code CLI.' },
  { name: 'Lovable', domain: 'lovable.dev', fallbackIcon: Bot, category: 'Development platforms', popular: true, description: 'Show ads on Lovable development platform.' },
  { name: 'Opencode', domain: 'opencode.ai', fallbackIcon: Terminal, category: 'Development platforms', popular: true, comingSoon: true, description: 'Show ads on Opencode CLI.' },
  { name: 'Replit', domain: 'replit.com', fallbackIcon: Terminal, category: 'Development platforms', popular: true, description: 'Show ads on Replit coding platform.' },

]

const MCP_CONNECTORS = [
  { name: 'ChatGPT', domain: 'chatgpt.com', fallbackIcon: Bot, category: 'AI chatbots', popular: true, description: 'Connect ChatGPT through MCP workflows.' },
  { name: 'Claude', domain: 'claude.ai', fallbackIcon: Bot, category: 'AI chatbots', popular: true, description: 'Connect Claude through MCP workflows.' },
  { name: 'Claude Code', domain: 'anthropic.com/claude-code', fallbackIcon: Terminal, category: 'AI chatbots', popular: true, description: 'Connect Claude Code command-line workflows.' },
  { name: 'Cursor CLI', domain: 'cursor.com', fallbackIcon: Terminal, category: 'AI chatbots', popular: true, description: 'Connect Cursor CLI agent workflows.' },
  { name: 'Antigravity CLI', domain: 'google.com', fallbackIcon: Terminal, category: 'AI chatbots', popular: false, description: 'Connect Antigravity CLI workflows.' },
  { name: 'Gemini CLI', domain: 'gemini.google.com', fallbackIcon: Terminal, category: 'AI chatbots', popular: false, description: 'Connect Gemini CLI agent workflows.' },
  { name: 'Codex CLI', domain: 'openai.com', fallbackIcon: Terminal, category: 'AI chatbots', popular: false, description: 'Connect Codex CLI agent workflows.' },
  { name: 'Opencode', domain: 'opencode.ai', fallbackIcon: Terminal, category: 'AI chatbots', popular: false, description: 'Connect Opencode terminal agent workflows.' },
  { name: 'Manus AI', domain: 'manus.im', fallbackIcon: Bot, category: 'AI chatbots', popular: false, description: 'Connect Manus AI agent workflows through MCP.' },
]

function ConnectorLogo({ domain, fallbackIcon: FallbackIcon }: { domain: string; fallbackIcon: React.ElementType }) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-white">
      {!hasError ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt=""
          className="h-6 w-6 rounded-sm object-contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <FallbackIcon className="h-5 w-5 text-gray-500" />
      )}
    </div>
  )
}

export default function ConnectorSelectionModal({ isOpen, type, onClose, onFinish }: ConnectorSelectionModalProps) {
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const connectors = type === 'MCP' ? MCP_CONNECTORS : CHROME_EXTENSION_CONNECTORS

  const categories = [...new Set(connectors.map(c => c.category))]
  const selectedCategory = connectors.find((connector) => connector.name === selectedConnectors[0])?.category

  useEffect(() => {
    if (isOpen) { setSelectedConnectors([]); setSearchQuery(''); setCategoryFilter('') }
  }, [isOpen, type])

  const filteredConnectors = connectors.filter(c => {
    if (categoryFilter && c.category !== categoryFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!c.name.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q)) return false
    }
    return true
  })

  const handleConnectorClick = (name: string, category: string) => {
    const isSelected = selectedConnectors.includes(name)

    if (isSelected) {
      setSelectedConnectors((current) => current.filter((connectorName) => connectorName !== name))
      return
    }

    if (selectedCategory && selectedCategory !== category) return

    // Chrome and Chrome Search are mutually exclusive
    if ((name === 'Chrome' || name === 'Chrome Search') &&
        selectedConnectors.some(n => n === 'Chrome' || n === 'Chrome Search')) {
      setSelectedConnectors((current) => current.filter(n => n !== 'Chrome' && n !== 'Chrome Search').concat(name))
      return
    }

    setSelectedConnectors((current) => [...current, name])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6">
      <div className="flex h-[88vh] max-h-[780px] w-[94vw] max-w-[1180px] flex-col overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <div className="flex h-14 shrink-0 items-center justify-end border-b border-gray-200 px-6">
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-[24px] font-medium leading-tight text-gray-900">Connectors</h1>
              <p className="mt-1.5 text-[13px] text-gray-500">Choose one or more connectors from the same category before creating your campaign.</p>
            </div>
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search all connectors"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-[10px] border border-gray-300 bg-white py-1.5 pl-9 pr-4 text-[13px] text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-5 flex justify-end relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 150)}
              className="flex items-center gap-2 rounded-[10px] border border-gray-300 bg-white px-3 py-1 text-[12px] text-gray-800 hover:bg-gray-50"
            >
              {categoryFilter || 'All categories'}
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full right-0 mt-1 w-44 rounded-[10px] border border-gray-200 bg-white shadow-lg z-10">
                <button
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { setCategoryFilter(''); setShowCategoryDropdown(false) }}
                  className={`w-full px-3 py-2 text-left text-[12px] hover:bg-gray-50 ${!categoryFilter ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                >
                  All categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setCategoryFilter(cat); setShowCategoryDropdown(false) }}
                    className={`w-full px-3 py-2 text-left text-[12px] hover:bg-gray-50 ${categoryFilter === cat ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredConnectors.map((connector) => {
              const isSelected = selectedConnectors.includes(connector.name)
              const isDisabled = Boolean((selectedCategory && selectedCategory !== connector.category && !isSelected) || connector.comingSoon)
              return (
                <button
                  key={connector.name}
                  onClick={() => handleConnectorClick(connector.name, connector.category)}
                  disabled={isDisabled}
                  className={`flex items-start gap-3.5 rounded-xl border bg-white p-4 text-left transition-all ${isSelected ? 'border-black ring-1 ring-black' : connector.comingSoon ? 'border-gray-100 bg-gray-50' : 'border-gray-200 hover:border-gray-300'} ${isDisabled ? 'cursor-not-allowed opacity-40 hover:border-gray-200' : ''}`}
                >
                  <ConnectorLogo domain={connector.domain} fallbackIcon={connector.fallbackIcon} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="text-[14px] font-medium text-gray-900">{connector.name}</h3>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{connector.category}</span>
                      {connector.comingSoon && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">Coming soon</span>
                      )}
                      {connector.popular && !connector.comingSoon && (
                        <span className="inline-flex items-center text-[11px] font-medium text-gray-500">
                          Popular <ArrowUpRight className="ml-0.5 h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-[12px] leading-relaxed text-gray-500">{connector.description}</p>
                  </div>
                  {isSelected && (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex h-16 shrink-0 items-center justify-between border-t border-gray-200 px-6">
          <p className="text-[12px] text-gray-500">
            {selectedConnectors.length > 0
              ? `${selectedConnectors.length} selected from ${selectedCategory}`
              : 'Select one or more connectors from the same category'}
          </p>
          <button
            onClick={() => selectedCategory && onFinish(selectedCategory, selectedConnectors)}
            disabled={selectedConnectors.length === 0}
            className="rounded-full bg-black px-4 py-1.5 text-[12px] font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  )
}
