'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Mail, Lock, User } from 'lucide-react'
import { toast } from 'sonner'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (isLogin) {
        result = await signIn(formData.email, formData.password)
      } else {
        result = await signUp(formData.email, formData.password, formData.name)
      }

      if (result.error) {
        toast.error(result.error.message || 'Erro na autenticação')
      } else {
        toast.success(isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!')
        onClose()
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="text-white text-center">
            {isLogin ? 'Entrar na sua conta' : 'Criar conta'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm text-gray-300 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Nome
                </label>
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('email', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Senha
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('password', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                isLogin ? 'Entrar' : 'Criar conta'
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {isLogin 
                ? 'Não tem conta? Criar conta' 
                : 'Já tem conta? Fazer login'
              }
            </button>
          </div>

          <div className="text-xs text-gray-400 text-center">
            Ao continuar, você concorda com nossos termos de uso e política de privacidade.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
