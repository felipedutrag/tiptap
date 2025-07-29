'use client'

import { useEditor } from '@/contexts/editor-context'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Highlighter,
  Undo,
  Redo,
  Sparkles
} from 'lucide-react'

export function TopToolbar() {
  const { editor } = useEditor()

  if (!editor) return null

  const addHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run()
  }

  const addImage = () => {
    const url = window.prompt('URL da imagem:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('URL do link:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const improveSelection = async () => {
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to)
    
    if (!text.trim()) {
      alert('Selecione um texto para melhorar')
      return
    }

    // This would integrate with our AI service
    console.log('Improving text:', text)
  }

  return (
    <div className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm p-2">
      <div className="flex items-center space-x-1 overflow-x-auto">
        {/* Undo/Redo */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="text-gray-400 hover:text-white"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="text-gray-400 hover:text-white"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addHeading(1)}
            className={`text-gray-400 hover:text-white ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addHeading(2)}
            className={`text-gray-400 hover:text-white ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addHeading(3)}
            className={`text-gray-400 hover:text-white ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <Heading3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive('paragraph') ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <Type className="w-4 h-4" />
          </Button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive('bold') ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive('italic') ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive('highlight') ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <Highlighter className="w-4 h-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive('bulletList') ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive('orderedList') ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>

        {/* Insert */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive('blockquote') ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`text-gray-400 hover:text-white ${
              editor.isActive('code') ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addLink}
            className="text-gray-400 hover:text-white"
          >
            <Link className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addImage}
            className="text-gray-400 hover:text-white"
          >
            <Image className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Features */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={improveSelection}
            className="text-gray-400 hover:text-white"
            title="Melhorar texto selecionado com IA"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
