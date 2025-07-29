'use client'

import { useEffect } from 'react'
import { useEditor as useEditorContext } from '@/contexts/editor-context'
import { useAuth } from '@/contexts/auth-context'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Typography from '@tiptap/extension-typography'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import { getUserColor } from '@/lib/utils'
import * as Y from 'yjs'

export function TiptapEditor() {
  const { user } = useAuth()
  const { contract, setEditor } = useEditorContext()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Remove conflicting extensions
      }),
      Placeholder.configure({
        placeholder: ({ node }: { node: any }) => {
          if (node.type.name === 'heading') {
            return 'Digite o título do contrato...'
          }
          return 'Digite o conteúdo do contrato ou use "/" para comandos...'
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 hover:text-blue-300 underline',
        },
      }),
      Typography,
      // Collaboration features
      Collaboration.configure({
        document: new Y.Doc(),
      }),
      CollaborationCursor.configure({
        provider: null, // We'll set this up later with Supabase
        user: user ? {
          name: user.user_metadata?.name || user.email || 'Anonymous',
          color: getUserColor(user.id),
        } : undefined,
      }),
    ],
    content: contract?.content || {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'CONTRATO' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '' }]
        }
      ]
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none p-8 focus:outline-none min-h-[calc(100vh-200px)]',
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save will be handled by the context
    },
  })

  useEffect(() => {
    if (editor) {
      setEditor(editor)
    }
    
    return () => {
      if (editor) {
        setEditor(null)
      }
    }
  }, [editor, setEditor])

  useEffect(() => {
    if (editor && contract?.content) {
      editor.commands.setContent(contract.content)
    }
  }, [editor, contract?.content])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <EditorContent 
          editor={editor} 
          className="tiptap-editor"
        />
      </div>

      <style jsx global>{`
        .tiptap-editor {
          color: white;
        }
        
        .tiptap-editor .ProseMirror {
          outline: none;
          line-height: 1.6;
        }
        
        .tiptap-editor .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          color: white;
          text-align: center;
        }
        
        .tiptap-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem;
          color: #93c5fd;
        }
        
        .tiptap-editor .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.75rem 0 0.5rem;
          color: #93c5fd;
        }
        
        .tiptap-editor .ProseMirror p {
          margin: 0.5rem 0;
          color: #d1d5db;
        }
        
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #6b7280;
          pointer-events: none;
          height: 0;
        }
        
        .tiptap-editor .ProseMirror ul, 
        .tiptap-editor .ProseMirror ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          color: #d1d5db;
        }
        
        .tiptap-editor .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .tiptap-editor .ProseMirror blockquote {
          border-left: 3px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #9ca3af;
        }
        
        .tiptap-editor .ProseMirror code {
          background-color: #374151;
          color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
        }
        
        .tiptap-editor .ProseMirror pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .tiptap-editor .ProseMirror hr {
          border: none;
          border-top: 1px solid #374151;
          margin: 2rem 0;
        }
        
        .tiptap-editor .ProseMirror strong {
          font-weight: bold;
          color: white;
        }
        
        .tiptap-editor .ProseMirror em {
          font-style: italic;
        }
        
        .tiptap-editor .ProseMirror a {
          color: #60a5fa;
          text-decoration: underline;
        }
        
        .tiptap-editor .ProseMirror a:hover {
          color: #93c5fd;
        }
        
        .tiptap-editor .ProseMirror .collaboration-cursor__caret {
          border-left: 1px solid;
          border-right: 1px solid;
          margin-left: -1px;
          margin-right: -1px;
          pointer-events: none;
          position: relative;
          word-break: normal;
        }
        
        .tiptap-editor .ProseMirror .collaboration-cursor__label {
          border-radius: 3px;
          color: #fff;
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          left: -1px;
          line-height: normal;
          padding: 0.1rem 0.3rem;
          position: absolute;
          top: -1.4em;
          user-select: none;
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}
