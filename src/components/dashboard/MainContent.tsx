import { useState, useCallback } from 'react'
import Header from './Header'
import Tabs from './Tabs'
import CampaignTable from './CampaignTable'
import CreateCampaignModal from './CreateCampaignModal'
import ConnectorSelectionModal from './ConnectorSelectionModal'

export default function MainContent() {
  const [isConnectorModalOpen, setIsConnectorModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
const [initialConnector, setInitialConnector] = useState('')
  const [modalKey, setModalKey] = useState(0)

  const openCreateModal = useCallback((connector: string) => {
    setInitialConnector(connector)
    setModalKey(k => k + 1)
    setIsCreateModalOpen(true)
  }, [])

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false)
    setInitialConnector('')
  }, [])

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      <Header onCreateClick={() => setIsConnectorModalOpen(true)} />
      <Tabs />
      <div className="flex-1 overflow-auto">
        <CampaignTable />
      </div>

      <ConnectorSelectionModal
        isOpen={isConnectorModalOpen}
        type="Chrome extension"
        onClose={() => setIsConnectorModalOpen(false)}
        onFinish={(_category, connectors) => {
          setIsConnectorModalOpen(false)
          openCreateModal(connectors[0] || '')
        }}
      />

      {isCreateModalOpen && (
        <CreateCampaignModal
          key={modalKey}
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          initialConnector={initialConnector}
        />
      )}
    </div>
  )
}
