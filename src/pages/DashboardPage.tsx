import Sidebar from '../components/dashboard/Sidebar'
import MainContent from '../components/dashboard/MainContent'

export default function DashboardPage() {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-gray-900 font-sans antialiased">
      <Sidebar />
      <MainContent />
    </div>
  )
}
