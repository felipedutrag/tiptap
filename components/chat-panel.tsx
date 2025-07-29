'use client'

import { useState, useRef, useEffect } from 'react'
import { useEditor } from '@/contexts/editor-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Bot, User, Sparkles, MessageCircle, X } from 'lucide-react'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ChatPanel() {
  const { contract, editor, improveText, analyzeContract } = useEditor()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou seu assistente jurídico. Posso ajudar você a:\n\n• Analisar o contrato atual\n• Sugerir melhorias em cláusulas\n• Responder dúvidas jurídicas\n• Reformular textos\n\nComo posso ajudar?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    addMessage('user', userMessage)
    setIsTyping(true)

    try {
      // Check for specific commands
      if (userMessage.toLowerCase().includes('analisar contrato')) {
        if (!contract) {
          addMessage('assistant', 'Não há contrato carregado para análise.')
          return
        }
        
        const analysis = await analyzeContract()
        addMessage('assistant', `**Análise do Contrato:**\n\n${analysis}`)
      } else if (userMessage.toLowerCase().includes('melhorar') && editor) {
        // Try to improve selected text or current paragraph
        const { from, to } = editor.state.selection
        const selectedText = editor.state.doc.textBetween(from, to)
        
        if (selectedText.trim()) {
          const improved = await improveText(selectedText)
          addMessage('assistant', `**Texto melhorado:**\n\n${improved}\n\n*Você pode copiar e colar no documento.*`)
        } else {
          addMessage('assistant', 'Por favor, selecione um texto no editor para que eu possa melhorá-lo.')
        }
      } else {
        // General AI conversation
        const response = await aiService.analyzeContract(`Pergunta do usuário: ${userMessage}`)
        addMessage('assistant', response.content || 'Desculpe, não consegui processar sua pergunta.')
      }
    } catch (error) {
      console.error('Chat error:', error)
      addMessage('assistant', 'Desculpe, ocorreu um erro. Tente novamente.')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
  }

  const suggestedQuestions = [
    'Analisar contrato atual',
    'Esta cláusula está correta?',
    'Que cláusulas estão faltando?',
    'Como melhorar este parágrafo?'
  ]

  return (
    <div className="h-full flex flex-col bg-gray-950 p-4">
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">Assistente Jurídico</h3>
            <p className="text-xs text-gray-400">IA especializada em contratos</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-100'
            } rounded-lg p-3`}>
              {message.type === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">Assistente</span>
                </div>
              )}
              <div 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 rounded-lg p-3 max-w-[85%]">
              <div className="flex items-center space-x-2 mb-2">
                <Bot className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">Assistente</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Perguntas sugeridas:</p>
          <div className="space-y-1">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => setInputMessage(question)}
                className="w-full text-left justify-start text-gray-300 hover:bg-gray-800 text-xs h-auto py-2"
              >
                <MessageCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex space-x-2">
        <Input
          value={inputMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua pergunta..."
          className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          disabled={isTyping}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        ⚡ Powered by Groq AI
      </div>
    </div>
  )
}
