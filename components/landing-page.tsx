'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useEditor } from '@/contexts/editor-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Users, Lock, Zap, FileText, Brain } from 'lucide-react'
import { toast } from 'sonner'

interface LandingPageProps {
  onAuth: () => void
}

export function LandingPage({ onAuth }: LandingPageProps) {
  const { user, signOut } = useAuth()
  const { generateFromPrompt, loading } = useEditor()
  const [prompt, setPrompt] = useState('')
  const [contractType, setContractType] = useState('geral')
  const [parties, setParties] = useState(['', ''])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Digite uma descrição para o contrato')
      return
    }

    if (!user) {
      onAuth()
      return
    }

    const validParties = parties.filter(p => p.trim())
    if (validParties.length < 2) {
      toast.error('Informe pelo menos duas partes para o contrato')
      return
    }

    try {
      await generateFromPrompt(prompt, contractType, validParties)
      toast.success('Contrato gerado com sucesso!')
    } catch (error) {
      toast.error('Erro ao gerar contrato. Tente novamente.')
    }
  }

  const addParty = () => {
    if (parties.length < 5) {
      setParties([...parties, ''])
    }
  }

  const updateParty = (index: number, value: string) => {
    const newParties = [...parties]
    newParties[index] = value
    setParties(newParties)
  }

  const removeParty = (index: number) => {
    if (parties.length > 2) {
      setParties(parties.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-semibold text-white">Numbly AI</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 text-sm">
                  Olá, {user.user_metadata?.name || user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Button
                onClick={onAuth}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">
            Crie Contratos Jurídicos
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}com IA
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Editor colaborativo estilo Notion com inteligência artificial para gerar,
            revisar e melhorar contratos profissionais em tempo real.
          </p>
        </div>

        {/* Contract Generator */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Brain className="w-6 h-6 text-blue-400" />
                <span>Gerador de Contratos IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6" suppressHydrationWarning>
              {/* Contract Description */}
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descreva o contrato que você precisa
                </label>
                <Textarea
                  placeholder="Ex: Contrato de prestação de serviços de desenvolvimento de software entre uma empresa de tecnologia e um cliente corporativo, com prazo de 6 meses..."
                  value={prompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
                  suppressHydrationWarning
                />
              </div>

              {/* Contract Type */}
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Contrato
                </label>
                <Select 
                  value={contractType} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setContractType(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  suppressHydrationWarning
                >
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="compra_venda">Compra e Venda</SelectItem>
                  <SelectItem value="locacao">Locação</SelectItem>
                  <SelectItem value="prestacao_servicos">Prestação de Serviços</SelectItem>
                  <SelectItem value="sociedade">Sociedade</SelectItem>
                  <SelectItem value="trabalho">Trabalho</SelectItem>
                </Select>
              </div>

              {/* Parties */}
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Partes Envolvidas
                </label>
                <div className="space-y-3">
                  {parties.map((party, index) => (
                    <div key={index} className="flex items-center space-x-2" suppressHydrationWarning>
                      <Input
                        placeholder={`Parte ${index + 1} (ex: João Silva - CPF 000.000.000-00)`}
                        value={party}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParty(index, e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        suppressHydrationWarning
                      />
                      {parties.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeParty(index)}
                          className="border-gray-600 text-red-400 hover:bg-red-900/20"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  {parties.length < 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addParty}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      suppressHydrationWarning
                    >
                      + Adicionar Parte
                    </Button>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                suppressHydrationWarning
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Gerando Contrato...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar Contrato com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card className="bg-gray-900/30 border-gray-700">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Colaboração em Tempo Real
              </h3>
              <p className="text-gray-400">
                Edite contratos em equipe com cursores coloridos e sincronização instantânea
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/30 border-gray-700">
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                IA Jurídica Avançada
              </h3>
              <p className="text-gray-400">
                Geração, revisão e sugestões inteligentes para cláusulas contratuais
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/30 border-gray-700">
            <CardContent className="p-6 text-center">
              <Lock className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Segurança e Backup
              </h3>
              <p className="text-gray-400">
                Versionamento automático e sincronização segura na nuvem
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950/80 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 Numbly AI. Criando o futuro dos contratos jurídicos.
          </p>
        </div>
      </footer>
    </div>
  )
}
