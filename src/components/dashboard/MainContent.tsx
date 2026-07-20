import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from './Header'

import CampaignTable from './CampaignTable'
import CreateCampaignModal from './CreateCampaignModal'
import ConnectorSelectionModal from './ConnectorSelectionModal'
import { apiFetch } from '../../lib/api'

export default function MainContent() {
  const [isConnectorModalOpen, setIsConnectorModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [initialConnector, setInitialConnector] = useState('')
  const [modalKey, setModalKey] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()
  const [paymentMessage, setPaymentMessage] = useState('')

  useEffect(() => {
    const payment = searchParams.get('payment')
    const campaignId = searchParams.get('campaign')
    if (payment === 'success' && campaignId) {
      setPaymentMessage('Payment confirmed! Activating your campaign...')
      apiFetch('/api/campaigns/confirm-payment', {
        method: 'POST',
        body: JSON.stringify({ campaignId }),
      }).then(() => {
        setPaymentMessage('Campaign is now live!')
        setSearchParams({}, { replace: true })
      }).catch(() => {
        setPaymentMessage('Payment received! Your campaign will be active shortly.')
        setSearchParams({}, { replace: true })
      })
    }
  }, [])

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
      {paymentMessage && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-200 text-[13px] text-green-800 font-medium">
          {paymentMessage}
        </div>
      )}
      <Header onCreateClick={() => setIsConnectorModalOpen(true)} />
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
