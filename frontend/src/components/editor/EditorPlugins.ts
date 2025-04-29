/**
 * EditorPlugins.ts
 * Configuration des plugins pour l'éditeur WYSIWYG
 * Gère les fonctionnalités comme l'historique, les raccourcis clavier, etc.
 */

import { Plugin } from 'prosemirror-state'
import { history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { tableEditing } from 'prosemirror-tables'

/**
 * Crée et configure les plugins de l'éditeur
 * @returns Un tableau de plugins ProseMirror configurés
 */
export const createEditorPlugins = (): Plugin[] => {
  return [
    // Plugin d'historique pour annuler/rétablir
    history(),

    // Plugin de raccourcis clavier de base
    keymap(baseKeymap),

    // Plugin d'édition de tableaux
    tableEditing(),

    // Plugin personnalisé pour la gestion des commentaires
    new Plugin({
      props: {
        handleClick(view, pos) {
          const { doc } = view.state
          const resolvedPos = doc.resolve(pos)
          const node = resolvedPos.parent
          
          if (node.type.name === 'comment') {
            // TODO: Implémenter la logique d'affichage des commentaires
            console.log('Commentaire cliqué:', node.attrs)
            return true
          }
          return false
        }
      }
    })
  ]
} 