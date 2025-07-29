'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import { Contract, ContractVersion, db } from '@/lib/database'
import { useAuth } from './auth-context'
import { generateId, createContractTitle } from '@/lib/utils'
import { syncService } from '@/lib/sync-service'
import { aiService } from '@/lib/ai-service'

interface EditorContextType {
  editor: Editor | null
  contract: Contract | null
  currentVersion: number
  versions: ContractVersion[]
  loading: boolean
  saving: boolean
  lastSaved: Date | null
  
  setEditor: (editor: Editor | null) => void
  createContract: (title?: string, content?: any) => Promise<Contract>
  loadContract: (id: string) => Promise<void>
  saveContract: () => Promise<void>
  saveVersion: (content: any) => Promise<void>
  loadVersion: (versionNumber: number) => Promise<void>
  generateFromPrompt: (prompt: string, type: string, parties: string[]) => Promise<void>
  improveText: (text: string) => Promise<string>
  analyzeContract: () => Promise<string>
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [editor, setEditor] = useState<Editor | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)
  const [currentVersion, setCurrentVersion] = useState(1)
  const [versions, setVersions] = useState<ContractVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Auto-save functionality
  useEffect(() => {
    if (!editor || !contract) return

    const handleUpdate = () => {
      saveContract()
    }

    const debouncedSave = debounce(handleUpdate, 2000)
    editor.on('update', debouncedSave)

    return () => {
      editor.off('update', debouncedSave)
    }
  }, [editor, contract, currentVersion])

  // Load versions when contract changes
  useEffect(() => {
    if (contract) {
      loadVersions()
    }
  }, [contract])

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  const createContract = useCallback(async (title?: string, content?: any): Promise<Contract> => {
    if (!user) throw new Error('User not authenticated')

    const contractId = generateId()
    const now = new Date()
    
    const newContract: Contract = {
      id: contractId,
      title: title || 'Novo Contrato',
      content: content || {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: title || 'CONTRATO' }]
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }]
          }
        ]
      },
      userId: user.id,
      paid: false,
      downloaded: false,
      synced: false,
      updatedAt: now,
      createdAt: now,
      versionNumber: 1,
      versions: []
    }

    await db.saveContract(newContract)
    setContract(newContract)
    setCurrentVersion(1)
    
    // Create initial version
    await saveVersion(newContract.content)
    
    return newContract
  }, [user])

  const loadContract = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const contract = await db.getContract(id)
      if (contract) {
        setContract(contract)
        setCurrentVersion(contract.versionNumber)
        
        if (editor) {
          editor.commands.setContent(contract.content)
        }
      }
    } catch (error) {
      console.error('Error loading contract:', error)
    } finally {
      setLoading(false)
    }
  }, [editor])

  const saveContract = useCallback(async () => {
    if (!contract || !editor || !user) return

    setSaving(true)
    try {
      const content = editor.getJSON()
      const updatedContract = {
        ...contract,
        content,
        updatedAt: new Date()
      }

      await db.saveContract(updatedContract)
      setContract(updatedContract)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving contract:', error)
    } finally {
      setSaving(false)
    }
  }, [contract, editor, user])

  const saveVersion = useCallback(async (content: any) => {
    if (!contract || !user) return

    const version: ContractVersion = {
      id: generateId(),
      contractId: contract.id,
      content,
      versionNumber: currentVersion + 1,
      createdAt: new Date(),
      createdBy: user.id,
      nodes: []
    }

    await db.saveContractVersion(version)
    setCurrentVersion(version.versionNumber)
    
    // Update contract version number
    const updatedContract = {
      ...contract,
      versionNumber: version.versionNumber,
      updatedAt: new Date()
    }
    
    await db.saveContract(updatedContract)
    setContract(updatedContract)
    
    loadVersions()
  }, [contract, user, currentVersion])

  const loadVersion = useCallback(async (versionNumber: number) => {
    if (!contract) return

    const versions = await db.getContractVersions(contract.id)
    const version = versions.find(v => v.versionNumber === versionNumber)
    
    if (version && editor) {
      editor.commands.setContent(version.content)
      setCurrentVersion(versionNumber)
    }
  }, [contract, editor])

  const loadVersions = useCallback(async () => {
    if (!contract) return

    const versions = await db.getContractVersions(contract.id)
    setVersions(versions)
  }, [contract])

  const generateFromPrompt = useCallback(async (prompt: string, type: string, parties: string[]) => {
    if (!user) return

    setLoading(true)
    try {
      const response = await aiService.generateContract({
        description: prompt,
        parties,
        type: type as any
      })

      if (response.success) {
        const title = createContractTitle(prompt)
        const content = convertTextToTiptapContent(response.content)
        
        const newContract = await createContract(title, content)
        
        if (editor) {
          // Animate typing effect
          await animateTyping(response.content)
        }
      }
    } catch (error) {
      console.error('Error generating contract:', error)
    } finally {
      setLoading(false)
    }
  }, [user, editor, createContract])

  const animateTyping = async (text: string) => {
    if (!editor) return

    editor.commands.clearContent()
    
    const words = text.split(' ')
    for (let i = 0; i < words.length; i++) {
      const chunk = words.slice(0, i + 1).join(' ')
      editor.commands.setContent(convertTextToTiptapContent(chunk))
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  const convertTextToTiptapContent = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const content = []

    for (const line of lines) {
      if (line.match(/^(CONTRATO|TÍTULO)/i)) {
        content.push({
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: line }]
        })
      } else if (line.match(/^(CLÁUSULA|PARTE|DISPOSIÇÕES)/i)) {
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: line }]
        })
      } else {
        content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: line }]
        })
      }
    }

    return {
      type: 'doc',
      content: content.length > 0 ? content : [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: text }]
        }
      ]
    }
  }

  const improveText = useCallback(async (text: string): Promise<string> => {
    if (!contract) return text

    const response = await aiService.improveClause(text, contract.title)
    return response.success ? response.content : text
  }, [contract])

  const analyzeContract = useCallback(async (): Promise<string> => {
    if (!editor || !contract) return ''

    const content = editor.getText()
    const response = await aiService.analyzeContract(content)
    return response.success ? response.content : 'Erro ao analisar contrato.'
  }, [editor, contract])

  const value = {
    editor,
    contract,
    currentVersion,
    versions,
    loading,
    saving,
    lastSaved,
    setEditor,
    createContract,
    loadContract,
    saveContract,
    saveVersion,
    loadVersion,
    generateFromPrompt,
    improveText,
    analyzeContract
  }

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}
