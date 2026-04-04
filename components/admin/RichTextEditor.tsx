'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useEffect, useCallback, useRef, useState } from 'react'
import MediaLibraryModal from './MediaLibraryModal'

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
  border: '1px solid #e8e8e8',
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

const SEP: React.CSSProperties = { width: 1, background: '#e8e8e8', margin: '0 4px', alignSelf: 'stretch' }

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const settingContent = useRef(false)
  const lastExternalContent = useRef(content)
  const [mediaOpen, setMediaOpen] = useState(false)
  const insertMode = useRef<'inline' | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
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
        style: 'min-height: 400px; padding: 16px; font-size: 15px; line-height: 1.8; color: #111; font-family: "Playfair Display", Georgia, serif; outline: none; background: #fff;',
      },
    },
    onUpdate: ({ editor }) => {
      if (!settingContent.current) {
        onChange(editor.getHTML())
      }
    },
  })

  useEffect(() => {
    if (editor && content !== lastExternalContent.current) {
      lastExternalContent.current = content
      settingContent.current = true
      editor.commands.setContent(content)
      settingContent.current = false
    }
  }, [content, editor])

  const openMediaForInline = useCallback(() => {
    insertMode.current = 'inline'
    setMediaOpen(true)
  }, [])

  const handleMediaSelect = useCallback((url: string) => {
    if (!editor) return
    if (insertMode.current === 'inline') {
      editor.chain().focus().setImage({ src: url }).run()
    }
    insertMode.current = null
  }, [editor])

  const addLink = useCallback(() => {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
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
    <>
      <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 10px', borderBottom: '1px solid #e8e8e8', background: '#f5f5f5' }}>
          <button onClick={() => editor.chain().focus().toggleBold().run()} style={editor.isActive('bold') ? BTN_ACTIVE : BTN} type="button">B</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} style={editor.isActive('italic') ? BTN_ACTIVE : BTN} type="button"><em>I</em></button>
          <span style={SEP} />
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={editor.isActive('heading', { level: 2 }) ? BTN_ACTIVE : BTN} type="button">H2</button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={editor.isActive('heading', { level: 3 }) ? BTN_ACTIVE : BTN} type="button">H3</button>
          <span style={SEP} />
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} style={editor.isActive('bulletList') ? BTN_ACTIVE : BTN} type="button">&bull; List</button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} style={editor.isActive('orderedList') ? BTN_ACTIVE : BTN} type="button">1. List</button>
          <button onClick={() => editor.chain().focus().toggleBlockquote().run()} style={editor.isActive('blockquote') ? BTN_ACTIVE : BTN} type="button">&ldquo; Quote</button>
          <span style={SEP} />
          <button onClick={addLink} style={editor.isActive('link') ? BTN_ACTIVE : BTN} type="button">
            {editor.isActive('link') ? 'Unlink' : 'Link'}
          </button>
          <button onClick={() => editor.chain().focus().setHorizontalRule().run()} style={BTN} type="button">&mdash;</button>
          <button onClick={openMediaForInline} style={BTN} type="button">Insert Image</button>
          <span style={SEP} />
          <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={{ ...BTN, opacity: editor.can().undo() ? 1 : 0.3 }} type="button">Undo</button>
          <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={{ ...BTN, opacity: editor.can().redo() ? 1 : 0.3 }} type="button">Redo</button>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} />

        {/* Styles */}
        <style>{`
          .ProseMirror { background: #fff; }
          .ProseMirror p { margin: 0 0 1em; }
          .ProseMirror h2, .ProseMirror h3 {
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
          .ProseMirror hr { border: none; border-top: 1px solid #e8e8e8; margin: 1.5em 0; }
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

      <MediaLibraryModal
        open={mediaOpen}
        onClose={() => { setMediaOpen(false); insertMode.current = null }}
        onSelect={handleMediaSelect}
      />
    </>
  )
}
