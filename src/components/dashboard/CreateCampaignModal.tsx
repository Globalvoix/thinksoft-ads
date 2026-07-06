import { useState, useRef, useEffect } from 'react'
import { X, Megaphone, ChevronDown, Calendar, Clock, Check, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiFetch } from '../../lib/api'
interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  initialConnector?: string
}

const CONNECTOR_CATEGORIES: Record<string, string> = {
  Chrome: 'Web browsers',
  ChatGPT: 'AI chatbots',
  Claude: 'AI chatbots',
  'Claude Code': 'Development platforms',
  Lovable: 'Development platforms',
  Opencode: 'Development platforms',
  Replit: 'Development platforms',

}

export default function CreateCampaignModal({ isOpen, onClose, initialConnector = '' }: CreateCampaignModalProps) {
  const [step, setStep] = useState(1)
  const [isPublished, setIsPublished] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [adTitle, setAdTitle] = useState('')
  const [adPrice, setAdPrice] = useState('')
  const [adCurrency, setAdCurrency] = useState('USD')
  const [adCountries, setAdCountries] = useState('United States')
  const [logoImage, setLogoImage] = useState<File | null>(null)
  const [bannerImage, setBannerImage] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')
  const [connectorCategory, setConnectorCategory] = useState('Web browsers')
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>([])
  const [hasInitialized, setHasInitialized] = useState(false)
  const isBrowserPreview = connectorCategory === 'Web browsers'
  const isChatbotPreview = connectorCategory === 'AI chatbots'
  const isEcommercePreview = connectorCategory === 'Ecommerce'
  const isChromeCardConnector = isBrowserPreview && selectedConnectors[0] === 'Chrome'
  const [budgetAmount, setBudgetAmount] = useState('25.00')
  const [maxCpcBid, setMaxCpcBid] = useState('3.50')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [contextHints, setContextHints] = useState('')
  const [adDescription, setAdDescription] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [targetedKeywords, setTargetedKeywords] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && initialConnector && !hasInitialized) {
      setSelectedConnectors([initialConnector])
      setConnectorCategory(CONNECTOR_CATEGORIES[initialConnector] || 'Web browsers')
      setHasInitialized(true)
    } else if (!isOpen) {
      setHasInitialized(false)
    }
  }, [isOpen, initialConnector, hasInitialized])

  const [location, setLocation] = useState('United States of America')
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const locationDropdownRef = useRef<HTMLDivElement>(null)

  const [budgetType, setBudgetType] = useState('Daily budget')
  const [isBudgetTypeOpen, setIsBudgetTypeOpen] = useState(false)
  const budgetDropdownRef = useRef<HTMLDivElement>(null)

  const [startDate, setStartDate] = useState(new Date(2026, 4, 28))
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1))
  const datePickerRef = useRef<HTMLDivElement>(null)

  const [time, setTime] = useState('11:05 AM')
  const [isTimeOpen, setIsTimeOpen] = useState(false)
  const timeDropdownRef = useRef<HTMLDivElement>(null)

  const [timezone, setTimezone] = useState('EDT')
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false)
  const [timezoneQuery, setTimezoneQuery] = useState('')
  const timezoneDropdownRef = useRef<HTMLDivElement>(null)

  const [hasEndDate, setHasEndDate] = useState(false)
  const [endDate, setEndDate] = useState(new Date(2026, 4, 30))
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false)
  const [currentEndMonth, setCurrentEndMonth] = useState(new Date(2026, 4, 1))
  const endDatePickerRef = useRef<HTMLDivElement>(null)

  const [endTime, setEndTime] = useState('11:05 AM')
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false)
  const endTimeDropdownRef = useRef<HTMLDivElement>(null)

  const [endTimezone, setEndTimezone] = useState('EDT')
  const [isEndTimezoneOpen, setIsEndTimezoneOpen] = useState(false)
  const [endTimezoneQuery, setEndTimezoneQuery] = useState('')
  const endTimezoneDropdownRef = useRef<HTMLDivElement>(null)

  const TIMEZONES = [
    { value: 'EDT', label: 'Eastern Daylight Time (EDT)' },
    { value: 'EST', label: 'Eastern Standard Time (EST)' },
    { value: 'CDT', label: 'Central Daylight Time (CDT)' },
    { value: 'CST', label: 'Central Standard Time (CST)' },
    { value: 'MDT', label: 'Mountain Daylight Time (MDT)' },
    { value: 'MST', label: 'Mountain Standard Time (MST)' },
    { value: 'PDT', label: 'Pacific Daylight Time (PDT)' },
    { value: 'PST', label: 'Pacific Standard Time (PST)' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'BST', label: 'British Summer Time (BST)' },
    { value: 'CET', label: 'Central European Time (CET)' },
    { value: 'CEST', label: 'Central European Summer Time (CEST)' },
    { value: 'EET', label: 'Eastern European Time (EET)' },
    { value: 'EEST', label: 'Eastern European Summer Time (EEST)' },
    { value: 'IST', label: 'Indian Standard Time (IST)' },
    { value: 'JST', label: 'Japan Standard Time (JST)' },
    { value: 'AEST', label: 'Australian Eastern Standard Time (AEST)' },
    { value: 'AEDT', label: 'Australian Eastern Daylight Time (AEDT)' },
    { value: 'NZST', label: 'New Zealand Standard Time (NZST)' },
    { value: 'NZDT', label: 'New Zealand Daylight Time (NZDT)' },
    { value: 'BRT', label: 'Brasília Time (BRT)' }
  ]

  const filteredTimezones = TIMEZONES.filter(tz =>
    tz.label.toLowerCase().includes(timezoneQuery.toLowerCase()) ||
    tz.value.toLowerCase().includes(timezoneQuery.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) setIsLocationOpen(false)
      if (budgetDropdownRef.current && !budgetDropdownRef.current.contains(event.target as Node)) setIsBudgetTypeOpen(false)
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) setIsDatePickerOpen(false)
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) setIsTimeOpen(false)
      if (timezoneDropdownRef.current && !timezoneDropdownRef.current.contains(event.target as Node)) setIsTimezoneOpen(false)
      if (endDatePickerRef.current && !endDatePickerRef.current.contains(event.target as Node)) setIsEndDatePickerOpen(false)
      if (endTimeDropdownRef.current && !endTimeDropdownRef.current.contains(event.target as Node)) setIsEndTimeOpen(false)
      if (endTimezoneDropdownRef.current && !endTimezoneDropdownRef.current.contains(event.target as Node)) setIsEndTimezoneOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!logoImage) { setLogoPreview(''); return }
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(logoImage)
  }, [logoImage])

  useEffect(() => {
    if (!bannerImage) { setBannerPreview(''); return }
    const reader = new FileReader()
    reader.onload = () => setBannerPreview(reader.result as string)
    reader.readAsDataURL(bannerImage)
  }, [bannerImage])

  if (!isOpen) return null

  const handleClose = () => {
    setStep(1); setIsPublished(false); setIsSaving(false); setContextHints(''); setAdDescription(''); setCtaText(''); setTargetedKeywords(''); setConnectorCategory('Web browsers'); setSelectedConnectors([]); onClose()
  }

  const confetti = Array.from({ length: 28 }, (_, i) => ({
    left: `${8 + ((i * 11) % 84)}%`,
    delay: `${(i % 7) * 0.08}s`,
    duration: `${1.5 + (i % 5) * 0.12}s`,
    color: ['bg-pink-500', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'][i % 5],
  }))

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth())
  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const endDaysInMonth = getDaysInMonth(currentEndMonth.getFullYear(), currentEndMonth.getMonth())
  const endFirstDay = getFirstDayOfMonth(currentEndMonth.getFullYear(), currentEndMonth.getMonth())
  const endBlanks = Array.from({ length: endFirstDay }, (_, i) => i)
  const endDays = Array.from({ length: endDaysInMonth }, (_, i) => i + 1)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-30px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(220px) rotate(540deg); opacity: 0; }
        }
      `}</style>
      <div className="bg-white w-[98vw] max-w-[1600px] h-[96vh] max-h-[900px] rounded-[10px] shadow-2xl flex flex-col overflow-hidden">
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5 text-gray-900">
            <Megaphone className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-[14px]">New campaign</span>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-800 transition-colors p-1 rounded-md hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-[260px] border-r border-gray-200 bg-white shrink-0 py-6 overflow-y-auto">
            <div className="flex flex-col gap-5 px-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${step > 1 ? 'bg-gray-500' : 'bg-[#1a1a1a]'} text-white flex items-center justify-center text-[11px] font-medium shrink-0`}>
                    {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                  </div>
                  <span className="text-[12px] font-medium text-gray-900">Create Campaign</span>
                </div>
                <div className="ml-[9px] pl-5 border-l-[1.5px] border-gray-200 py-1 space-y-2">
                  <div className="flex items-center gap-2 bg-transparent text-gray-900 py-1.5 rounded-md text-[12px] font-medium">
                    <Megaphone className="w-3.5 h-3.5 text-gray-600" />
                    {campaignName || 'Untitled campaign'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${step === 2 ? 'bg-[#1a1a1a] text-white' : step > 2 ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-500'} flex items-center justify-center text-[11px] font-medium shrink-0`}>
                    {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                  </div>
                  <span className={`text-[12px] font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>Create Ad Group & Ads</span>
                </div>
                {step >= 2 && (
                  <div className="ml-[9px] pl-5 border-l-[1.5px] border-gray-200 py-1 space-y-2">
                    <div className="text-[12px] py-1.5 px-2 text-gray-900 font-medium">Ad info</div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full ${step === 3 ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-500'} flex items-center justify-center text-[11px] font-medium shrink-0`}>
                  3
                </div>
                <span className={`text-[12px] font-medium ${step === 3 ? 'text-gray-900' : 'text-gray-500'}`}>Review</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-8">
            {step === 1 ? (
              <>
                <div className="max-w-[560px] space-y-7">
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-gray-900">Campaign name</label>
                    <input type="text" placeholder="New traffic campaign" value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                  </div>



                  <div className="space-y-2 relative" ref={locationDropdownRef}>
                    <label className="block text-[12px] font-medium text-gray-900">Locations for this campaign</label>
                    <div className="relative cursor-pointer group" onClick={() => setIsLocationOpen(!isLocationOpen)}>
                      <div className={`w-full border ${isLocationOpen ? 'border-black ring-1 ring-black' : 'border-gray-300 group-hover:border-gray-400'} rounded-md px-3 py-1.5 text-[12px] text-gray-900 bg-white transition-all duration-200 flex justify-between items-center`}>
                        <span>{location}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLocationOpen ? 'rotate-180 text-black' : 'text-gray-500 group-hover:text-gray-700'}`} />
                      </div>
                    </div>
                    {isLocationOpen && (
                      <div className="absolute top-[60px] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10 p-1.5">
                        {['All', 'United States of America', 'Canada', 'Australia', 'New Zealand'].map(opt => (
                          <button key={opt} onClick={() => { setLocation(opt); setIsLocationOpen(false) }}
                            className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-md flex items-center gap-2.5 transition-all">
                            <div className="w-4 flex justify-center">{location === opt && <Check className="w-4 h-4 text-black" />}</div>
                            {opt}
                          </button>
                        ))}
                        <div className="h-[1px] bg-gray-100 my-1"></div>
                        <button onClick={() => { setLocation('Enter another location'); setIsLocationOpen(false) }}
                          className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-md flex items-center gap-2.5 transition-all">
                          <div className="w-4 flex justify-center">{location === 'Enter another location' && <Check className="w-4 h-4 text-black" />}</div>
                          Enter another location
                        </button>
                      </div>
                    )}
                    {location === 'Enter another location' && (
                      <div className="mt-2">
                        <div className="relative">
                          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input type="text" placeholder="Search for a country, territory, region, or city"
                            className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-1.5 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                        </div>
                      </div>
                    )}
                    <p className="text-[11px] text-gray-500 mt-1">Campaign will only show in selected locations.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-gray-900">Budget</label>
                    <div className="flex items-center gap-3">
                      <div className="relative w-[180px]" ref={budgetDropdownRef}>
                        <div className="relative cursor-pointer group" onClick={() => setIsBudgetTypeOpen(!isBudgetTypeOpen)}>
                          <div className={`w-full border ${isBudgetTypeOpen ? 'border-black ring-1 ring-black' : 'border-gray-300 group-hover:border-gray-400'} rounded-md px-3 py-1.5 text-[12px] text-gray-900 bg-white transition-all duration-200 flex justify-between items-center`}>
                            <span>{budgetType}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isBudgetTypeOpen ? 'rotate-180 text-black' : 'text-gray-500 group-hover:text-gray-700'}`} />
                          </div>
                        </div>
                        {isBudgetTypeOpen && (
                          <div className="absolute top-[34px] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10 p-1.5">
                            {['Daily budget', 'Campaign budget'].map(opt => (
                              <button key={opt} onClick={() => { setBudgetType(opt); setIsBudgetTypeOpen(false) }}
                                className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-md flex items-center gap-2.5 transition-all">
                                <div className="w-4 flex justify-center">{budgetType === opt && <Check className="w-4 h-4 text-black" />}</div>
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 relative flex items-center border border-gray-300 rounded-md px-3 py-1.5 focus-within:border-black transition-shadow">
                        <span className="text-gray-500 text-[12px] mr-2">$</span>
                        <input type="text" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} className="flex-1 text-[12px] text-gray-900 focus:outline-none min-w-0 bg-transparent" />
                        <span className="text-gray-500 text-[12px] ml-2 shrink-0">USD</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Your budget type (daily or campaign total) is set when the campaign is created and can't be changed later. You can change your budget amount at any time.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-gray-900">Bid per 1000 impressions</label>
                    <p className="text-[11px] text-gray-500">Set the amount you'll pay per 1000 ad impressions. A higher bid gets priority placement.</p>
                    <div className="flex items-center gap-8">
                      <div className="w-[260px] flex items-center border border-gray-300 rounded-md px-3 py-1.5 focus-within:border-black transition-shadow">
                        <span className="text-gray-500 text-[12px] mr-3">$</span>
                        <input type="text" value={maxCpcBid} onChange={(e) => setMaxCpcBid(e.target.value)} className="flex-1 text-[12px] text-gray-900 focus:outline-none bg-transparent" />
                        <span className="text-gray-500 text-[12px] ml-2">USD</span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        <div className="flex items-center gap-2 font-medium text-green-700">
                          <span className="inline-flex gap-1">
                            <span className="w-4 h-1 rounded-full bg-green-500"></span>
                            <span className="w-4 h-1 rounded-full bg-green-500"></span>
                            <span className="w-4 h-1 rounded-full bg-green-500"></span>
                          </span>
                          Strong Delivery
                        </div>
                        <p className="mt-1">Your bid is likely competitive for this ad group.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 relative" ref={datePickerRef}>
                    <label className="block text-[12px] font-medium text-gray-900">Start date</label>
                    <div className="flex items-center gap-3">
                      <div className="relative w-[200px] cursor-pointer group" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
                        <div className={`w-full border ${isDatePickerOpen ? 'border-black ring-1 ring-black' : 'border-gray-300 group-hover:border-gray-400'} rounded-md pl-8 pr-10 py-1.5 text-[12px] text-gray-900 bg-white transition-all duration-200 flex items-center`}>
                          <Calendar className="w-3.5 h-3.5 text-gray-500 absolute left-3" />
                          <span>{formatDate(startDate)}</span>
                          <ChevronDown className={`w-4 h-4 absolute right-3 transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180 text-black' : 'text-gray-500 group-hover:text-gray-700'}`} />
                        </div>
                      </div>

                      <div className="flex items-center border border-gray-300 rounded-md px-1.5 py-1 focus-within:border-black transition-shadow">
                        <Clock className="w-3.5 h-3.5 text-gray-500 mx-1.5 shrink-0" />
                        <div className="relative" ref={timeDropdownRef}>
                          <div className="flex items-center cursor-pointer px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors" onClick={() => setIsTimeOpen(!isTimeOpen)}>
                            <span className="w-[55px] text-[12px] text-gray-900 focus:outline-none bg-transparent p-0 select-none">{time}</span>
                          </div>
                          {isTimeOpen && (
                            <div className="absolute bottom-[calc(100%+8px)] left-0 w-[140px] max-h-[240px] overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 p-1.5 custom-scrollbar">
                              {Array.from({ length: 48 }).map((_, i) => {
                                const hours = Math.floor(i / 2); const minutes = (i % 2) * 30
                                const ampm = hours >= 12 ? 'PM' : 'AM'; const displayHours = hours % 12 || 12
                                const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
                                return (
                                  <button key={timeString}
                                    className={`w-full text-left px-3 py-1.5 text-[12px] font-medium rounded-md flex items-center gap-2.5 transition-all ${time === timeString ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
                                    onClick={() => { setTime(timeString); setIsTimeOpen(false) }}>
                                    <div className="w-4 flex justify-center">{time === timeString && <Check className="w-3.5 h-3.5 text-black" />}</div>
                                    {timeString}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <div className="h-4 w-px bg-gray-200 mx-1"></div>
                        <div className="relative" ref={timezoneDropdownRef}>
                          <div className="flex items-center cursor-pointer px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors" onClick={() => setIsTimezoneOpen(!isTimezoneOpen)}>
                            <span className="w-[30px] text-[11px] text-gray-500 focus:outline-none bg-transparent uppercase p-0 select-none">{timezone}</span>
                          </div>
                          {isTimezoneOpen && (
                            <div className="absolute bottom-[calc(100%+8px)] right-0 w-[240px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 overflow-hidden flex flex-col">
                              <div className="p-2 border-b border-gray-100">
                                <div className="relative">
                                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                  <input type="text" placeholder="Search timezone..." value={timezoneQuery}
                                    onChange={(e) => setTimezoneQuery(e.target.value)} onClick={(e) => e.stopPropagation()}
                                    className="w-full pl-8 pr-3 py-1.5 text-[12px] text-gray-900 bg-gray-50 border border-transparent rounded-md focus:outline-none focus:bg-white focus:border-gray-300 transition-colors" />
                                </div>
                              </div>
                              <div className="max-h-[200px] overflow-y-auto p-1.5 custom-scrollbar">
                                {filteredTimezones.length === 0 ? (
                                  <div className="px-3 py-4 text-center text-[12px] text-gray-500">No timezones found</div>
                                ) : filteredTimezones.map(tz => (
                                  <button key={tz.value}
                                    className={`w-full text-left px-3 py-1.5 text-[12px] font-medium rounded-md flex items-center gap-2.5 transition-all ${timezone === tz.value ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
                                    onClick={() => { setTimezone(tz.value); setIsTimezoneOpen(false); setTimezoneQuery('') }}>
                                    <div className="w-4 shrink-0 flex justify-center">{timezone === tz.value && <Check className="w-3.5 h-3.5 text-black" />}</div>
                                    <span className="truncate">{tz.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isDatePickerOpen && (
                      <div className="absolute bottom-[calc(100%+8px)] left-0 w-[280px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[13px] font-medium text-gray-900">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)) }}
                              className="p-1 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)) }}
                              className="p-1 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-[11px] font-medium text-gray-500 text-center py-1">{day}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {blanks.map(blank => <div key={`blank-${blank}`} className="p-1" />)}
                          {days.map(day => {
                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                            const isSelected = date.getTime() === startDate.getTime()
                            return (
                              <button key={day} onClick={() => { setStartDate(date); setIsDatePickerOpen(false) }}
                                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-[12px] transition-colors ${isSelected ? 'bg-black text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                                {day}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block text-[12px] font-medium text-gray-900">End date</label>
                    <label className="flex items-center gap-2.5 cursor-pointer w-fit" onClick={(e) => { e.preventDefault(); setHasEndDate(!hasEndDate) }}>
                      <div className={`w-4 h-4 rounded border ${hasEndDate ? 'bg-black border-black text-white' : 'border-gray-300 bg-white'} flex items-center justify-center transition-colors`}>
                        {hasEndDate && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-[12px] text-gray-700 select-none">Set an end date</span>
                    </label>
                    {hasEndDate && (
                      <div className="flex items-center gap-3 mt-3">
                        <div className="relative w-[200px]" ref={endDatePickerRef}>
                          <div className="relative w-full cursor-pointer group" onClick={() => setIsEndDatePickerOpen(!isEndDatePickerOpen)}>
                            <div className={`w-full border ${isEndDatePickerOpen ? 'border-black ring-1 ring-black' : 'border-gray-300 group-hover:border-gray-400'} rounded-md pl-8 pr-10 py-1.5 text-[12px] text-gray-900 bg-white transition-all duration-200 flex items-center`}>
                              <Calendar className="w-3.5 h-3.5 text-gray-500 absolute left-3" />
                              <span>{formatDate(endDate)}</span>
                              <ChevronDown className={`w-4 h-4 absolute right-3 transition-transform duration-200 ${isEndDatePickerOpen ? 'rotate-180 text-black' : 'text-gray-500 group-hover:text-gray-700'}`} />
                            </div>
                          </div>
                          {isEndDatePickerOpen && (
                            <div className="absolute bottom-[calc(100%+8px)] left-0 w-[280px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10 p-4">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-[13px] font-medium text-gray-900">{currentEndMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                <div className="flex items-center gap-1">
                                  <button onClick={(e) => { e.stopPropagation(); setCurrentEndMonth(new Date(currentEndMonth.getFullYear(), currentEndMonth.getMonth() - 1, 1)) }}
                                    className="p-1 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); setCurrentEndMonth(new Date(currentEndMonth.getFullYear(), currentEndMonth.getMonth() + 1, 1)) }}
                                    className="p-1 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                                </div>
                              </div>
                              <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                  <div key={day} className="text-[11px] font-medium text-gray-500 text-center py-1">{day}</div>
                                ))}
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {endBlanks.map(blank => <div key={`blank-${blank}`} className="p-1" />)}
                                {endDays.map(day => {
                                  const date = new Date(currentEndMonth.getFullYear(), currentEndMonth.getMonth(), day)
                                  const isSelected = date.getTime() === endDate.getTime()
                                  return (
                                    <button key={day} onClick={() => { setEndDate(date); setIsEndDatePickerOpen(false) }}
                                      className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-[12px] transition-colors ${isSelected ? 'bg-black text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                                      {day}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center border border-gray-300 rounded-md px-1.5 py-1 focus-within:border-black transition-shadow">
                          <Clock className="w-3.5 h-3.5 text-gray-500 mx-1.5 shrink-0" />
                          <div className="relative" ref={endTimeDropdownRef}>
                            <div className="flex items-center cursor-pointer px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors" onClick={() => setIsEndTimeOpen(!isEndTimeOpen)}>
                              <span className="w-[55px] text-[12px] text-gray-900 focus:outline-none bg-transparent p-0 select-none">{endTime}</span>
                            </div>
                            {isEndTimeOpen && (
                              <div className="absolute bottom-[calc(100%+8px)] left-0 w-[140px] max-h-[240px] overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 p-1.5 custom-scrollbar">
                                {Array.from({ length: 48 }).map((_, i) => {
                                  const hours = Math.floor(i / 2); const minutes = (i % 2) * 30
                                  const ampm = hours >= 12 ? 'PM' : 'AM'; const displayHours = hours % 12 || 12
                                  const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
                                  return (
                                    <button key={timeString}
                                      className={`w-full text-left px-3 py-1.5 text-[12px] font-medium rounded-md flex items-center gap-2.5 transition-all ${endTime === timeString ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
                                      onClick={() => { setEndTime(timeString); setIsEndTimeOpen(false) }}>
                                      <div className="w-4 flex justify-center">{endTime === timeString && <Check className="w-3.5 h-3.5 text-black" />}</div>
                                      {timeString}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                          <div className="h-4 w-px bg-gray-200 mx-1"></div>
                          <div className="relative" ref={endTimezoneDropdownRef}>
                            <div className="flex items-center cursor-pointer px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors" onClick={() => setIsEndTimezoneOpen(!isEndTimezoneOpen)}>
                              <span className="w-[30px] text-[11px] text-gray-500 focus:outline-none bg-transparent uppercase p-0 select-none">{endTimezone}</span>
                            </div>
                            {isEndTimezoneOpen && (
                              <div className="absolute bottom-[calc(100%+8px)] right-0 w-[240px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 overflow-hidden flex flex-col">
                                <div className="p-2 border-b border-gray-100">
                                  <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input type="text" placeholder="Search timezone..." value={endTimezoneQuery}
                                      onChange={(e) => setEndTimezoneQuery(e.target.value)} onClick={(e) => e.stopPropagation()}
                                      className="w-full pl-8 pr-3 py-1.5 text-[12px] text-gray-900 bg-gray-50 border border-transparent rounded-md focus:outline-none focus:bg-white focus:border-gray-300 transition-colors" />
                                  </div>
                                </div>
                                <div className="max-h-[200px] overflow-y-auto p-1.5 custom-scrollbar">
                                  {TIMEZONES.filter(tz => tz.label.toLowerCase().includes(endTimezoneQuery.toLowerCase()) || tz.value.toLowerCase().includes(endTimezoneQuery.toLowerCase())).length === 0 ? (
                                    <div className="px-3 py-4 text-center text-[12px] text-gray-500">No timezones found</div>
                                  ) : TIMEZONES.filter(tz => tz.label.toLowerCase().includes(endTimezoneQuery.toLowerCase()) || tz.value.toLowerCase().includes(endTimezoneQuery.toLowerCase())).map(tz => (
                                    <button key={tz.value}
                                      className={`w-full text-left px-3 py-1.5 text-[12px] font-medium rounded-md flex items-center gap-2.5 transition-all ${endTimezone === tz.value ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
                                      onClick={() => { setEndTimezone(tz.value); setIsEndTimezoneOpen(false); setEndTimezoneQuery('') }}>
                                      <div className="w-4 shrink-0 flex justify-center">{endTimezone === tz.value && <Check className="w-3.5 h-3.5 text-black" />}</div>
                                      <span className="truncate">{tz.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-12 pr-4">
                  <button onClick={() => setStep(2)}
                    className="px-4 py-1.5 text-[11.5px] font-medium bg-black hover:bg-gray-800 text-white rounded-full transition-colors shadow-sm">
                    Continue
                  </button>
                </div>
              </>
            ) : step === 2 ? (
              <>
                <div className="max-w-[680px] space-y-6 mx-auto">
                  {isBrowserPreview ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Ad title</label>
                        <input type="text" placeholder="Enter ad title" value={adTitle} onChange={(e) => setAdTitle(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Description</label>
                        <textarea placeholder="Describe your product or service" value={adDescription} onChange={(e) => setAdDescription(e.target.value)}
                          className="w-full min-h-[76px] resize-none border border-gray-200 rounded-md px-3 py-2 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      {!isChromeCardConnector && (
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Call to Action</label>
                        <input type="text" placeholder="Learn more" value={ctaText} onChange={(e) => setCtaText(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                      </div>)}
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Website URL</label>
                        <input type="text" value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} placeholder="https://example.com/"
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      {!isChromeCardConnector && (
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Targeted keywords</label>
                        <textarea placeholder="Enter keywords separated by commas" value={targetedKeywords} onChange={(e) => setTargetedKeywords(e.target.value)}
                          className="w-full min-h-[60px] resize-none border border-gray-200 rounded-md px-3 py-2 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                      </div>)}
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Logo image</label>
                        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-white px-3 py-3 text-center text-[12px] text-gray-500 hover:border-gray-400 transition-colors">
                          {logoPreview ? (
                            <><img src={logoPreview} alt="Logo preview" className="mb-2 h-14 w-14 rounded-md object-cover" />
                            <span className="max-w-full truncate text-gray-700">{logoImage?.name}</span>
                            <span className="mt-1 text-[11px] text-gray-400">Click to replace</span></>
                          ) : 'Upload logo image'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoImage(e.target.files?.[0] ?? null)} />
                        </label>
                      </div>
                    </>
                  ) : isChatbotPreview ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Ad title</label>
                        <input type="text" placeholder="Enter ad title" value={adTitle} onChange={(e) => setAdTitle(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Description</label>
                        <textarea placeholder="Describe your product or service" value={adDescription} onChange={(e) => setAdDescription(e.target.value)}
                          className="w-full min-h-[76px] resize-none border border-gray-200 rounded-md px-3 py-2 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Website URL</label>
                        <input type="text" value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} placeholder="https://example.com/"
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Context hints</label>
                        <p className="text-[11px] text-gray-500 leading-relaxed">Describe the conversations, topics, or keywords where your products or services may be relevant; these hints guide matching for AI chatbot interactions.</p>
                        <textarea placeholder="Describe the context where your ad should appear, e.g. people looking for privacy fencing solutions"
                          value={contextHints} onChange={(e) => setContextHints(e.target.value)}
                          className="w-full min-h-[76px] resize-none border border-gray-200 rounded-md px-3 py-2 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2`}>
                        <div className="space-y-2">
                          <label className="block text-[12px] font-medium text-gray-900">Logo image</label>
                          <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-white px-3 py-3 text-center text-[12px] text-gray-500 hover:border-gray-400 transition-colors">
                            {logoPreview ? (
                              <><img src={logoPreview} alt="Logo preview" className="mb-2 h-14 w-14 rounded-md object-cover" />
                              <span className="max-w-full truncate text-gray-700">{logoImage?.name}</span>
                              <span className="mt-1 text-[11px] text-gray-400">Click to replace</span></>
                            ) : 'Upload logo image'}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoImage(e.target.files?.[0] ?? null)} />
                          </label>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[12px] font-medium text-gray-900">Banner image</label>
                          <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-white px-3 py-3 text-center text-[12px] text-gray-500 hover:border-gray-400 transition-colors">
                            {bannerPreview ? (
                              <><img src={bannerPreview} alt="Banner preview" className="mb-2 h-14 w-full rounded-md object-cover" />
                              <span className="max-w-full truncate text-gray-700">{bannerImage?.name}</span>
                              <span className="mt-1 text-[11px] text-gray-400">Click to replace</span></>
                            ) : 'Upload banner image'}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setBannerImage(e.target.files?.[0] ?? null)} />
                          </label>
                        </div>
                      </div>
                    </>
                  ) : isEcommercePreview ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Ad title</label>
                        <input type="text" placeholder="Enter product title" value={adTitle} onChange={(e) => setAdTitle(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-[12px] font-medium text-gray-900">Price</label>
                          <input type="text" placeholder="49.99" value={adPrice} onChange={(e) => setAdPrice(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[12px] font-medium text-gray-900">Currency</label>
                          <input type="text" placeholder="USD" value={adCurrency} onChange={(e) => setAdCurrency(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Product URL</label>
                        <input type="text" value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} placeholder="https://amazon.com/product/example"
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Countries where this ad will show</label>
                        <input type="text" placeholder="United States, Canada" value={adCountries} onChange={(e) => setAdCountries(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Product image</label>
                        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-white px-3 py-3 text-center text-[12px] text-gray-500 hover:border-gray-400 transition-colors">
                          {logoPreview ? (
                            <><img src={logoPreview} alt="Product preview" className="mb-2 h-14 w-14 rounded-md object-cover" />
                            <span className="max-w-full truncate text-gray-700">{logoImage?.name}</span>
                            <span className="mt-1 text-[11px] text-gray-400">Click to replace</span></>
                          ) : 'Upload product image'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoImage(e.target.files?.[0] ?? null)} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Ad title</label>
                        <input type="text" placeholder="Enter ad title" value={adTitle} onChange={(e) => setAdTitle(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Website URL</label>
                        <input type="text" value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} placeholder="https://example.com/"
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[12px] text-gray-900 focus:outline-none focus:border-black transition-shadow" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-medium text-gray-900">Logo image</label>
                        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-white px-3 py-3 text-center text-[12px] text-gray-500 hover:border-gray-400 transition-colors">
                          {logoPreview ? (
                            <><img src={logoPreview} alt="Logo preview" className="mb-2 h-14 w-14 rounded-md object-cover" />
                            <span className="max-w-full truncate text-gray-700">{logoImage?.name}</span>
                            <span className="mt-1 text-[11px] text-gray-400">Click to replace</span></>
                          ) : 'Upload logo image'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoImage(e.target.files?.[0] ?? null)} />
                        </label>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end mt-12 pr-4">
                    <button onClick={() => setStep(3)}
                      className="px-4 py-1.5 text-[11.5px] font-medium bg-black hover:bg-gray-800 text-white rounded-full transition-colors shadow-sm">
                      Continue
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="relative flex min-h-full flex-col items-center justify-center gap-6 py-4">
                {isPublished && (
                  <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                    {confetti.map((piece, index) => (
                      <span key={index} className={`absolute top-8 h-3 w-2 rounded-sm ${piece.color}`}
                        style={{ left: piece.left, animation: `confetti-fall ${piece.duration} ease-out ${piece.delay} forwards` }} />
                    ))}
                    <div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-2xl bg-white px-8 py-5 text-center shadow-2xl ring-1 ring-gray-100">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                        <Check className="h-5 w-5" />
                      </div>
                      <p className="text-[16px] font-semibold text-gray-900">Campaign published</p>
                      <p className="mt-1 text-[12px] text-gray-500">Your ad is ready to run.</p>
                    </div>
                  </div>
                )}
                <div className="w-[390px] rounded-[42px] bg-gray-900 p-3 shadow-2xl">
                  <div className="overflow-hidden rounded-[32px] bg-white">
                    <div className="flex h-10 items-center justify-between px-5 pt-2 text-[13px] font-semibold text-gray-900">
                      <span>11:30</span>
                      <span className="text-[11px]">▮▮  ◓  ▰</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <span className="text-xl text-gray-700">≡</span>
                      <span className="text-[16px] font-semibold text-gray-900">{isEcommercePreview ? 'Shop' : isBrowserPreview ? 'Browser' : 'ChatGPT'}</span>
                      <span className="text-xl text-gray-700">⋯</span>
                    </div>
                    {isEcommercePreview ? (
                      <div className="space-y-4 px-5 py-5 text-gray-900">
                        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-[13px] text-gray-500">
                          <Search className="h-3.5 w-3.5" />
                          Search products
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">Sponsored</span>
                            <span className="text-[11px] text-gray-500">Ships to {adCountries || 'United States'}</span>
                          </div>
                          {logoPreview ? (
                            <img src={logoPreview} alt="Product" className="mb-3 h-36 w-full rounded-xl object-cover" />
                          ) : (
                            <div className="mb-3 flex h-36 w-full items-center justify-center rounded-xl bg-gray-100 text-[12px] text-gray-500">Product image</div>
                          )}
                          <p className="text-[15px] font-semibold leading-tight">{adTitle || 'Easy-Install Privacy Panel'}</p>
                          <p className="mt-1 text-[13px] leading-snug text-gray-500">{'Create backyard privacy in no time with an easy-to-install cedar panel.'}</p>
                          <p className="mt-2 text-[18px] font-semibold text-gray-900">{adCurrency || 'USD'} {adPrice || '49.99'}</p>
                        </div>
                      </div>
                    ) : isBrowserPreview ? (
                      <div className="space-y-4 px-5 py-5 text-gray-900">
                        <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-[13px] text-gray-500">https://www.google.com/search?q=privacy+fence+ideas</div>
                        <div className="space-y-3">
                          <p className="text-[13px] text-gray-500">Search results</p>
                          <div className="rounded-xl border border-gray-100 p-3">
                            <p className="text-[14px] font-medium text-blue-700">How to choose the right privacy fence</p>
                            <p className="mt-1 text-[12px] leading-relaxed text-gray-500">Compare wood, vinyl, chain-link, and decorative fence options for your yard.</p>
                          </div>
                          <div className="rounded-xl border border-gray-100 p-3">
                            <p className="text-[14px] font-medium text-blue-700">Backyard privacy ideas</p>
                            <p className="mt-1 text-[12px] leading-relaxed text-gray-500">Design inspiration and product options for fast backyard upgrades.</p>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {logoPreview ? (
                                <img src={logoPreview} alt="Ad logo" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-[14px] text-white">A</div>
                              )}
                              <div>
                                <p className="text-[13px] font-semibold">{campaignName || 'Your Brand'}</p>
                                <p className="text-[11px] text-gray-500">Sponsored</p>
                              </div>
                            </div>
                            <span className="text-gray-500">⋯</span>
                          </div>
                          <p className="text-[15px] font-semibold leading-tight">{adTitle || 'Easy-Install Privacy Panel'}</p>
                          <p className="mt-1 text-[13px] leading-snug text-gray-500">{'Create backyard privacy in no time with an easy-to-install cedar panel.'}</p>
                          {!isChatbotPreview && <button className="mt-3 rounded-full bg-black px-4 py-1.5 text-[12px] font-medium text-white">Learn more</button>}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5 px-5 py-5 text-[15px] leading-relaxed text-gray-900">
                        <p>Think of it like this:</p>
                        <p className="font-semibold">Posts (vertical anchors) → Rails (horizontal frame) → Boards/Panels (visible fence) → Hardware (holds it all together)</p>
                        <div className="h-px bg-gray-100" />
                        <div>
                          <p className="mb-2">If you want, tell me:</p>
                          <ul className="ml-5 list-disc space-y-1">
                            <li>wood vs vinyl vs chain-link</li>
                            <li>fence height</li>
                            <li>privacy vs decorative</li>
                          </ul>
                        </div>
                        <p>...and I can give you a <span className="font-semibold">precise shopping list with quantities</span> for your yard.</p>
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-4 text-[13px] text-gray-500">
                          <span>▢</span><span>♡</span><span>↗</span><span>⋯</span><span>Sources</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {logoPreview ? (
                                <img src={logoPreview} alt="Ad logo" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-[14px] text-white">A</div>
                              )}
                              <span className="text-[15px] font-semibold">{campaignName || 'Your Brand'} · Sponsored</span>
                            </div>
                            <span className="text-gray-500">⋯</span>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                            <div className="min-w-0 flex-1">
                              <p className="text-[15px] font-semibold leading-tight">{adTitle || 'Easy-Install Privacy Panel'}</p>
                              <p className="mt-1 text-[14px] leading-snug text-gray-500">{'Create backyard privacy in no time with an easy-to-install cedar panel.'}</p>
                              <p className="mt-2 text-[13px] font-semibold text-gray-700">Learn more</p>
                            </div>
                            {bannerPreview ? (
                              <img src={bannerPreview} alt="Ad banner" className="h-20 w-20 rounded-xl object-cover" />
                            ) : (
                              <div className="h-20 w-20 rounded-xl bg-gray-200" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setIsSaving(true)
                    try {
                      const displayUrl = destinationUrl ? new URL(destinationUrl).hostname.replace('www.', '') : 'thinksoft.dev'
                      const result = await apiFetch<any>('/api/campaigns', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: campaignName,
                            location,
                            budgetType,
                            budgetAmount: parseFloat(budgetAmount) || 25,
                            startDate: startDate.toISOString(),
                            endDate: hasEndDate ? endDate.toISOString() : null,
                            connectorType: selectedConnectors[0] || 'Chrome extension',
                            connectorCategory,
                            selectedConnectors,
                            maxCpcBid: parseFloat(maxCpcBid) || 0,
                            destinationUrl,
                            displayUrl,
                            contextHints,
                            description: adDescription,
                            cta: ctaText || 'Learn more',
                            targetedKeywords,
                            headline: adTitle,
                            logoUrl: logoPreview || '',
                            bannerUrl: bannerPreview || '',
                          })
                      })
                      if (result.checkoutUrl) {
                        window.open(result.checkoutUrl, '_blank')
                      }
                      setIsPublished(true)
                    } catch (e) {
                      alert('Failed to save campaign: ' + (e instanceof Error ? e.message : 'Network error'))
                    } finally {
                      setIsSaving(false)
                    }
                  }}
                  disabled={isSaving}
                  className="px-5 py-2 text-[12px] font-medium bg-black hover:bg-gray-800 text-white rounded-full transition-colors shadow-sm disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Finish'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
