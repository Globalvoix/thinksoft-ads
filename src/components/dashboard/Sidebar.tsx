import { useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  Megaphone,
  Wrench,
  Receipt,
  Settings,
  ChevronDown,
  PanelLeftClose,
  Aperture,
  LogOut,
} from 'lucide-react'

export default function Sidebar() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="w-[200px] border-r border-gray-200 h-screen flex flex-col bg-white shrink-0">
      <div className="h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Aperture className="w-[18px] h-[18px] text-black" strokeWidth={2.5} />
          <span className="font-semibold text-black text-[13px]">Ads Manager</span>
          <span className="text-[9px] bg-gray-100 text-black px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold ml-1">Beta</span>
        </div>
        <button className="text-black hover:text-black transition-colors">
          <PanelLeftClose className="w-[16px] h-[16px]" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-2 space-y-1">
        <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-black">
          <Megaphone className="w-4 h-4 text-black" />
          Campaigns
        </a>

        <a href="#" className="flex items-center justify-between px-2 py-1.5 text-xs font-medium rounded-lg text-black hover:bg-gray-50 hover:text-black transition-colors">
          <div className="flex items-center gap-2.5">
            <Wrench className="w-4 h-4 text-black" />
            Tools
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-black" />
        </a>

        <a href="#" className="flex items-center justify-between px-2 py-1.5 text-xs font-medium rounded-lg text-black hover:bg-gray-50 hover:text-black transition-colors">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-4 h-4 text-black" />
            Billing
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-black" />
        </a>

        <a href="#" className="flex items-center justify-between px-2 py-1.5 text-xs font-medium rounded-lg text-black hover:bg-gray-50 hover:text-black transition-colors">
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-black" />
            Settings
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-black" />
        </a>
      </nav>

      <div className="border-t border-gray-200 px-3 py-3 space-y-2">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden shrink-0">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-600">
                  {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-gray-900 truncate">
                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {user.primaryEmailAddress?.emailAddress || ''}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-2 py-1.5 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
