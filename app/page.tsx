'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useEditor } from '@/contexts/editor-context'
import { LandingPage } from '@/components/landing-page'
import { WorkspaceLayout } from '@/components/workspace-layout'
import { AuthModal } from '@/components/auth-modal'
import { ClientOnly } from '@/components/client-only'

export default function Home() {
  const { user } = useAuth()
  const { contract } = useEditor()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-white">Carregando...</div>
      </div>
    }>
      {!user ? (
        <>
          <LandingPage onAuth={() => setShowAuth(true)} />
          <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
        </>
      ) : !contract ? (
        <LandingPage onAuth={() => {}} />
      ) : (
        <WorkspaceLayout />
      )}
    </ClientOnly>
  )
}
