/**
 * EditorSchema.ts
 * Définit la structure du document et les types de contenu autorisés
 * Configure les nœuds et les marques disponibles dans l'éditeur
 */

import { Schema } from 'prosemirror-model'
import { nodes as basicNodes, marks as basicMarks } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'
import { tableNodes } from 'prosemirror-tables'

// Extension des nœuds de base avec les nœuds de liste
const listNodesSpec = {
  ordered_list: {
    content: "list_item+",
    group: "block",
    attrs: { order: { default: 1 } },
    parseDOM: [{ tag: "ol", getAttrs(dom: HTMLElement) {
      return { order: dom.hasAttribute("start") ? +dom.getAttribute("start")! : 1 }
    }}],
    toDOM(node: any) {
      return node.attrs.order === 1 ? ["ol", 0] : ["ol", { start: node.attrs.order }, 0]
    }
  },
  bullet_list: {
    content: "list_item+",
    group: "block",
    parseDOM: [{ tag: "ul" }],
    toDOM() { return ["ul", 0] }
  },
  list_item: {
    content: "paragraph block*",
    parseDOM: [{ tag: "li" }],
    toDOM() { return ["li", 0] }
  }
}

// Configuration des nœuds
const nodes = {
  // Nœud de document racine
  doc: {
    content: 'block+'
  },
  // Paragraphe standard
  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM() { return ['p', 0] }
  },
  // Titres
  heading: {
    attrs: { level: { default: 1 } },
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [
      { tag: "h1", attrs: { level: 1 } },
      { tag: "h2", attrs: { level: 2 } },
      { tag: "h3", attrs: { level: 3 } },
      { tag: "h4", attrs: { level: 4 } },
      { tag: "h5", attrs: { level: 5 } },
      { tag: "h6", attrs: { level: 6 } }
    ],
    toDOM(node: any) { return ["h" + node.attrs.level, 0] }
  },
  // Bloc de code
  code_block: {
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM() { return ['pre', ['code', 0]] }
  },
  // Texte simple
  text: {
    group: 'inline'
  },
  // Ajout des nœuds de liste
  ...listNodesSpec,
  // Ajout des nœuds de tableau
  ...tableNodes({
    tableGroup: 'block',
    cellContent: 'block+',
    cellAttributes: {
      background: { default: null },
      colspan: { default: 1 },
      rowspan: { default: 1 }
    }
  })
}

// Configuration des marques
const marks = {
  ...basicMarks,
  // Surlignage
  highlight: {
    attrs: { class: { default: 'highlight' } },
    parseDOM: [{ tag: 'mark' }],
    toDOM() { return ['mark', 0] }
  },
  // Commentaires
  comment: {
    attrs: {
      id: { default: '' },
      text: { default: '' }
    },
    inclusive: false,
    parseDOM: [{ tag: 'span.comment' }],
    toDOM() { return ['span', { class: 'comment' }, 0] }
  },
  // Style de code inline
  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM() { return ['code', 0] }
  }
}

// Création et export du schéma
export const editorSchema = new Schema({
  nodes,
  marks
}) 