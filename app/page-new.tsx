'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useEditor } from '@/contexts/editor-context'
import { LandingPage } from '@/components/landing-page'
import { WorkspaceLayout } from '@/components/workspace-layout'
import { AuthModal } from '@/components/auth-modal'

export default function Home() {
  const { user } = useAuth()
  const { contract } = useEditor()
  const [showAuth, setShowAuth] = useState(false)

  // If not authenticated, show landing page
  if (!user) {
    return (
      <>
        <LandingPage onAuth={() => setShowAuth(true)} />
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </>
    )
  }

  // If authenticated but no contract, show landing with user logged in
  if (!contract) {
    return <LandingPage onAuth={() => {}} />
  }

  // If authenticated and has contract, show workspace
  return <WorkspaceLayout />
}
