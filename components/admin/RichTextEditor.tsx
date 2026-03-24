'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useEffect, useCallback, useRef } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

const BTN: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 12,
  fontWeight: 600,
  background: 'none',
  border: '1px solid #e8e2d8',
  borderRadius: 4,
  cursor: 'pointer',
  color: '#555',
  minWidth: 32,
  lineHeight: 1,
}

const BTN_ACTIVE: React.CSSProperties = {
  ...BTN,
  background: '#1a1a1a',
  color: '#fff',
  borderColor: '#1a1a1a',
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  // Track whether we're programmatically setting content to avoid feedback loops
  const settingContent = useRef(false)
  const lastExternalContent = useRef(content)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'article-image',
          loading: 'lazy',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        style: 'min-height: 400px; padding: 16px; font-size: 15px; line-height: 1.8; color: #333; font-family: "Playfair Display", Georgia, serif; outline: none;',
      },
    },
    onUpdate: ({ editor }) => {
      // Don't fire onChange when we're programmatically setting content
      if (!settingContent.current) {
        onChange(editor.getHTML())
      }
    },
  })

  // Update content when it changes externally (e.g. from importer)
  useEffect(() => {
    if (editor && content !== lastExternalContent.current) {
      lastExternalContent.current = content
      settingContent.current = true
      editor.commands.setContent(content)
      settingContent.current = false
    }
  }, [content, editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addLink = useCallback(() => {
    if (!editor) return

    // If already a link, remove it
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }

    // Get the current selection text for the prompt
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)

    if (!selectedText) {
      window.alert('Select some text first, then click Link to add a URL.')
      return
    }

    const url = window.prompt('Enter URL:', 'https://')
    if (url && url !== 'https://') {
      editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div style={{ border: '1px solid #e8e2d8' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 10px', borderBottom: '1px solid #e8e2d8', background: '#fafaf5' }}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={editor.isActive('bold') ? BTN_ACTIVE : BTN}
          type="button"
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={editor.isActive('italic') ? BTN_ACTIVE : BTN}
          type="button"
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={editor.isActive('strike') ? BTN_ACTIVE : BTN}
          type="button"
        >
          S
        </button>
        <span style={{ width: 1, background: '#e8e2d8', margin: '0 4px' }} />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={editor.isActive('heading', { level: 2 }) ? BTN_ACTIVE : BTN}
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={editor.isActive('heading', { level: 3 }) ? BTN_ACTIVE : BTN}
          type="button"
        >
          H3
        </button>
        <span style={{ width: 1, background: '#e8e2d8', margin: '0 4px' }} />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={editor.isActive('bulletList') ? BTN_ACTIVE : BTN}
          type="button"
        >
          &bull; List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={editor.isActive('orderedList') ? BTN_ACTIVE : BTN}
          type="button"
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={editor.isActive('blockquote') ? BTN_ACTIVE : BTN}
          type="button"
        >
          &ldquo; Quote
        </button>
        <span style={{ width: 1, background: '#e8e2d8', margin: '0 4px' }} />
        <button onClick={addLink} style={editor.isActive('link') ? BTN_ACTIVE : BTN} type="button">
          {editor.isActive('link') ? 'Unlink' : 'Link'}
        </button>
        <button
          onClick={() => {
            if (!editor) return
            if (confirm('Remove ALL links from this article? The text will be kept.')) {
              editor.chain().focus().selectAll().unsetLink().run()
            }
          }}
          style={{ ...BTN, color: '#cc4444' }}
          type="button"
        >
          Remove All Links
        </button>
        <button onClick={addImage} style={BTN} type="button">
          Image
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Styles */}
      <style>{`
        .ProseMirror p { margin: 0 0 1em; }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4 {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 400;
          margin: 1.5em 0 0.5em;
        }
        .ProseMirror h2 { font-size: 24px; }
        .ProseMirror h3 { font-size: 20px; }
        .ProseMirror blockquote {
          border-left: 3px solid #a58e28;
          padding-left: 16px;
          margin: 1em 0;
          font-style: italic;
          color: #555;
        }
        .ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 0 0 1em; }
        .ProseMirror li { margin: 0.25em 0; }
        .ProseMirror a { color: #a58e28; text-decoration: underline; }
        .ProseMirror .article-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
          display: block;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: '${placeholder || "Write your article here..."}';
          color: #bbb;
          float: left;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  )
}
