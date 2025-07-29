'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useEditor } from '@/contexts/editor-context'
import { TiptapEditor } from '@/components/tiptap-editor'
import { Sidebar } from '@/components/sidebar'
import { ChatPanel } from '@/components/chat-panel'
import { TopToolbar } from '@/components/top-toolbar'
import { Button } from '@/components/ui/button'
import { 
  PanelLeft, 
  MessageCircle, 
  Users, 
  Settings, 
  Save,
  History,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function WorkspaceLayout() {
  const { user, signOut } = useAuth()
  const { 
    contract, 
    saving, 
    lastSaved, 
    saveContract, 
    analyzeContract 
  } = useEditor()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [presenceUsers, setPresenceUsers] = useState<any[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysis, setAnalysis] = useState('')

  // Auto-save indicator
  const getSaveStatus = () => {
    if (saving) return 'Salvando...'
    if (lastSaved) {
      const diff = Date.now() - lastSaved.getTime()
      if (diff < 5000) return 'Salvo'
      const minutes = Math.floor(diff / 60000)
      if (minutes === 0) return 'Salvo agora'
      if (minutes === 1) return 'Salvo há 1 min'
      return `Salvo há ${minutes} min`
    }
    return 'Não salvo'
  }

  const handleAnalyze = async () => {
    try {
      const result = await analyzeContract()
      setAnalysis(result)
      setShowAnalysis(true)
      toast.success('Análise do contrato concluída!')
    } catch (error) {
      toast.error('Erro ao analisar contrato')
    }
  }

  const handleExport = () => {
    if (!contract?.paid) {
      toast.error('Pagamento necessário para download')
      // Open payment modal
      return
    }
    
    // Export logic here
    toast.success('Download iniciado')
  }

  if (!contract) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center text-gray-400">
          <p>Nenhum contrato selecionado</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm flex items-center justify-between px-4 z-10">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="text-white font-medium">Numbly AI</span>
          </div>

          <div className="text-gray-500 text-sm">
            {contract.title}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Save Status */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Save className="w-4 h-4" />
            <span>{getSaveStatus()}</span>
          </div>

          {/* Presence Users */}
          <div className="flex items-center space-x-1">
            {presenceUsers.slice(0, 3).map((user, index) => (
              <div
                key={user.id}
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {presenceUsers.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
                +{presenceUsers.length - 3}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAnalyze}
              className="text-gray-400 hover:text-white"
              title="Analisar contrato"
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChatOpen(!chatOpen)}
              className="text-gray-400 hover:text-white"
              title="Chat com IA"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="text-gray-400 hover:text-white"
              title="Baixar PDF"
            >
              <Download className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-gray-700" />

            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-400 hover:text-white"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 border-r border-gray-800 bg-gray-950",
          sidebarOpen ? "w-80" : "w-0"
        )}>
          {sidebarOpen && <Sidebar />}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <TopToolbar />
          
          {/* Editor */}
          <div className="flex-1 overflow-auto">
            <TiptapEditor />
          </div>
        </div>

        {/* Chat Panel */}
        <div className={cn(
          "transition-all duration-300 border-l border-gray-800 bg-gray-950",
          chatOpen ? "w-80" : "w-0"
        )}>
          {chatOpen && <ChatPanel />}
        </div>
      </div>

      {/* Analysis Modal */}
      {showAnalysis && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Análise do Contrato</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalysis(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </div>
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap">{analysis}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
