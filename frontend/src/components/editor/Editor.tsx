/**
 * Editor.tsx
 * Composant principal de l'éditeur WYSIWYG.
 * Il gère l'initialisation de ProseMirror et la configuration des plugins.
 */

import React, { useEffect, useRef, useState } from 'react'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser } from 'prosemirror-model'
import { schema } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { editorSchema } from './EditorSchema'
import { createEditorPlugins } from './EditorPlugins'
import { EditorToolbar } from './EditorToolbar'
import './Editor.css'

interface EditorProps {
  content?: string
  onChange?: (content: string) => void
  readOnly?: boolean
}

const DEFAULT_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: ' ' }]
    }
  ]
}

/**
 * Composant Editor
 * @param content - Contenu initial de l'éditeur (optionnel)
 * @param onChange - Fonction appelée lors des modifications du contenu
 * @param readOnly - Mode lecture seule (optionnel)
 */
export const Editor: React.FC<EditorProps> = ({
  content = '',
  onChange,
  readOnly = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    try {
      // Parse le contenu JSON avec gestion d'erreur
      let parsedContent
      try {
        parsedContent = content ? JSON.parse(content) : DEFAULT_CONTENT
        // S'assurer qu'il n'y a pas de nœuds de texte vides
        if (parsedContent.content) {
          parsedContent.content = parsedContent.content.map((node: any) => {
            if (node.type === 'paragraph' && (!node.content || node.content.length === 0)) {
              return {
                ...node,
                content: [{ type: 'text', text: ' ' }]
              }
            }
            return node
          })
        }
      } catch (e) {
        console.warn('Erreur de parsing du contenu JSON, utilisation du contenu par défaut:', e)
        parsedContent = DEFAULT_CONTENT
      }

      // Création de l'état initial de l'éditeur
      const state = EditorState.create({
        schema: editorSchema,
        plugins: createEditorPlugins(),
        doc: editorSchema.nodeFromJSON(parsedContent)
      })

      // Création de la vue de l'éditeur
      const view = new EditorView(editorRef.current, {
        state,
        dispatchTransaction(transaction) {
          const newState = view.state.apply(transaction)
          view.updateState(newState)

          if (onChange) {
            try {
              const json = newState.doc.toJSON()
              onChange(JSON.stringify(json))
            } catch (e) {
              console.error('Erreur lors de la sérialisation du contenu:', e)
            }
          }
        }
      })

      viewRef.current = view
      setError(null)

      // Nettoyage lors du démontage du composant
      return () => {
        view.destroy()
      }
    } catch (e) {
      console.error('Erreur lors de l\'initialisation de l\'éditeur:', e)
      setError('Une erreur est survenue lors de l\'initialisation de l\'éditeur')
    }
  }, [content, onChange])

  if (error) {
    return <div className="editor-error">{error}</div>
  }

  return (
    <div className="editor-container">
      {!readOnly && viewRef.current && (
        <EditorToolbar view={viewRef.current} />
      )}
      <div
        ref={editorRef}
        className="prosemirror-editor"
        contentEditable={!readOnly}
      />
    </div>
  )
}

export default Editor 