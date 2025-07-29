'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useEditor } from '@/contexts/editor-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  Filter,
  ChevronDown,
  ChevronRight,
  Trash2,
  Archive
} from 'lucide-react'
import { db, Contract } from '@/lib/database'
import { formatDate, getRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'

export function Sidebar() {
  const { user } = useAuth()
  const { contract, createContract, loadContract } = useEditor()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showVersions, setShowVersions] = useState(false)

  useEffect(() => {
    loadContracts()
  }, [user])

  const loadContracts = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const userContracts = await db.getUserContracts(user.id)
      setContracts(userContracts)
    } catch (error) {
      console.error('Error loading contracts:', error)
      toast.error('Erro ao carregar contratos')
    } finally {
      setLoading(false)
    }
  }

  const handleNewContract = async () => {
    try {
      await createContract()
      await loadContracts()
      toast.success('Novo contrato criado!')
    } catch (error) {
      toast.error('Erro ao criar contrato')
    }
  }

  const handleSelectContract = async (contractId: string) => {
    try {
      await loadContract(contractId)
    } catch (error) {
      toast.error('Erro ao carregar contrato')
    }
  }

  const filteredContracts = contracts.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-gray-950 p-4">
      {/* Header */}
      <div className="mb-4">
        <Button
          onClick={handleNewContract}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar contratos..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Recent Contracts */}
      <div className="flex-1 overflow-auto">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
            Recentes
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum contrato encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContracts.map((contractItem) => (
                <Card
                  key={contractItem.id}
                  className={`cursor-pointer transition-all hover:bg-gray-800 ${
                    contract?.id === contractItem.id
                      ? 'bg-gray-800 border-blue-500'
                      : 'bg-gray-900/50 border-gray-700'
                  }`}
                  onClick={() => handleSelectContract(contractItem.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {contractItem.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {getRelativeTime(contractItem.updatedAt)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            contractItem.paid
                              ? 'bg-green-900/20 text-green-400'
                              : 'bg-yellow-900/20 text-yellow-400'
                          }`}>
                            {contractItem.paid ? 'Pago' : 'Pendente'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            contractItem.synced
                              ? 'bg-blue-900/20 text-blue-400'
                              : 'bg-red-900/20 text-red-400'
                          }`}>
                            {contractItem.synced ? 'Sync' : 'Local'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-xs text-gray-500">
                          v{contractItem.versionNumber}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Contract Versions (if current contract is selected) */}
        {contract && (
          <div className="mt-6 pt-4 border-t border-gray-800">
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white mb-2 w-full"
            >
              {showVersions ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <Clock className="w-4 h-4" />
              <span>Versões</span>
            </button>

            {showVersions && (
              <div className="space-y-1 ml-6">
                <div className="text-xs text-gray-500 p-2 bg-gray-800 rounded">
                  <div className="flex items-center justify-between">
                    <span>Versão {contract.versionNumber} (atual)</span>
                    <span>{formatDate(contract.updatedAt)}</span>
                  </div>
                </div>
                
                {/* Previous versions would be loaded here */}
                <div className="text-xs text-gray-600 p-2">
                  Versões anteriores serão exibidas aqui
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center space-x-2">
            <span>Total: {contracts.length} contratos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
