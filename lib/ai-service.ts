import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
})

export interface AIResponse {
  content: string
  success: boolean
  error?: string
}

export interface ContractPrompt {
  description: string
  parties: string[]
  type: 'compra_venda' | 'locacao' | 'prestacao_servicos' | 'sociedade' | 'trabalho' | 'geral'
}

export class AIService {
  async generateContract(prompt: ContractPrompt): Promise<AIResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(prompt.type)
      const userPrompt = this.buildUserPrompt(prompt)

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'mixtral-8x7b-32768',
        temperature: 0.7,
        max_tokens: 4096
      })

      const content = completion.choices[0]?.message?.content || ''
      
      return {
        content: this.formatContractContent(content),
        success: true
      }
    } catch (error) {
      console.error('AI Generation Error:', error)
      return {
        content: '',
        success: false,
        error: 'Erro ao gerar contrato. Tente novamente.'
      }
    }
  }

  async improveClause(clause: string, context: string): Promise<AIResponse> {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em contratos jurídicos. Melhore a cláusula fornecida tornando-a mais clara, completa e juridicamente robusta. Mantenha o mesmo sentido, mas aprimore a redação.`
          },
          {
            role: 'user',
            content: `Contexto do contrato: ${context}\n\nCláusula a melhorar: ${clause}`
          }
        ],
        model: 'mixtral-8x7b-32768',
        temperature: 0.5,
        max_tokens: 1024
      })

      const content = completion.choices[0]?.message?.content || ''
      
      return {
        content,
        success: true
      }
    } catch (error) {
      console.error('AI Improvement Error:', error)
      return {
        content: clause,
        success: false,
        error: 'Erro ao melhorar cláusula.'
      }
    }
  }

  async suggestClause(context: string, position: string): Promise<AIResponse> {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em contratos jurídicos. Sugira uma cláusula apropriada para a posição indicada no contrato, considerando o contexto fornecido.`
          },
          {
            role: 'user',
            content: `Contexto do contrato: ${context}\n\nPosição no contrato: ${position}\n\nSugira uma cláusula adequada para esta posição.`
          }
        ],
        model: 'mixtral-8x7b-32768',
        temperature: 0.6,
        max_tokens: 512
      })

      const content = completion.choices[0]?.message?.content || ''
      
      return {
        content,
        success: true
      }
    } catch (error) {
      console.error('AI Suggestion Error:', error)
      return {
        content: '',
        success: false,
        error: 'Erro ao sugerir cláusula.'
      }
    }
  }

  async analyzeContract(content: string): Promise<AIResponse> {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em análise de contratos jurídicos. Analise o contrato fornecido e identifique:
            1. Cláusulas faltantes importantes
            2. Pontos de risco ou ambiguidade
            3. Sugestões de melhoria
            4. Conformidade legal básica
            
            Forneça uma análise clara e objetiva.`
          },
          {
            role: 'user',
            content: `Analise este contrato:\n\n${content}`
          }
        ],
        model: 'mixtral-8x7b-32768',
        temperature: 0.3,
        max_tokens: 2048
      })

      const content_response = completion.choices[0]?.message?.content || ''
      
      return {
        content: content_response,
        success: true
      }
    } catch (error) {
      console.error('AI Analysis Error:', error)
      return {
        content: '',
        success: false,
        error: 'Erro ao analisar contrato.'
      }
    }
  }

  private getSystemPrompt(type: string): string {
    const basePrompt = `Você é um especialista em contratos jurídicos brasileiros. Gere um contrato completo e profissional seguindo as normas do direito brasileiro.

    Estruture o contrato com:
    1. TÍTULO do contrato
    2. PARTES envolvidas (qualificação completa)
    3. CLÁUSULAS numeradas e organizadas
    4. DISPOSIÇÕES GERAIS
    5. FORO e legislação aplicável
    6. Local e data
    7. ASSINATURAS

    Use linguagem jurídica apropriada, seja claro e completo. Inclua cláusulas essenciais para o tipo de contrato solicitado.`

    const typeSpecific = {
      compra_venda: 'Foque em: objeto da venda, preço, forma de pagamento, entrega, garantias, vícios ocultos.',
      locacao: 'Foque em: imóvel, prazo, aluguel, reajustes, benfeitorias, rescisão, fiador/seguro.',
      prestacao_servicos: 'Foque em: serviços, prazo, remuneração, responsabilidades, entrega, confidencialidade.',
      sociedade: 'Foque em: capital social, quotas, administração, distribuição lucros, retirada sócios.',
      trabalho: 'Foque em: função, salário, jornada, benefícios, confidencialidade, rescisão.',
      geral: 'Adapte conforme o tipo de contrato solicitado.'
    }

    return `${basePrompt}\n\n${typeSpecific[type as keyof typeof typeSpecific] || typeSpecific.geral}`
  }

  private buildUserPrompt(prompt: ContractPrompt): string {
    return `Gere um contrato com as seguintes especificações:

    Descrição: ${prompt.description}
    
    Partes envolvidas: ${prompt.parties.join(' e ')}
    
    Tipo de contrato: ${prompt.type.replace('_', ' ')}
    
    Gere um contrato completo, profissional e juridicamente sólido.`
  }

  private formatContractContent(content: string): string {
    // Ensure proper formatting for TipTap editor
    return content
      .replace(/\n\n/g, '\n')
      .replace(/^\s+/gm, '')
      .trim()
  }
}

export const aiService = new AIService()
