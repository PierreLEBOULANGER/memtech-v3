/**
 * EditorToolbar.tsx
 * Composant de la barre d'outils de l'éditeur WYSIWYG
 * Fournit les boutons pour formater le texte et insérer des éléments
 */

import React, { useState } from 'react';
import { EditorView } from 'prosemirror-view';
import { toggleMark, setBlockType, wrapIn, lift } from 'prosemirror-commands';
import { schema } from './EditorSchema';

interface EditorToolbarProps {
  view: EditorView;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ view }) => {
  const { state } = view;
  const { schema } = state;
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Fonctions de formatage du texte
  const toggleBold = () => {
    toggleMark(schema.marks.strong)(state, view.dispatch);
  };

  const toggleItalic = () => {
    toggleMark(schema.marks.em)(state, view.dispatch);
  };

  const toggleUnderline = () => {
    toggleMark(schema.marks.underline)(state, view.dispatch);
  };

  const toggleCode = () => {
    toggleMark(schema.marks.code)(state, view.dispatch);
  };

  const toggleStrike = () => {
    toggleMark(schema.marks.strike)(state, view.dispatch);
  };

  // Fonctions de formatage des blocs
  const setHeading = (level: number) => {
    setBlockType(schema.nodes.heading, { level })(state, view.dispatch);
  };

  const setParagraph = () => {
    setBlockType(schema.nodes.paragraph)(state, view.dispatch);
  };

  const setCodeBlock = () => {
    setBlockType(schema.nodes.code_block)(state, view.dispatch);
  };

  const setBlockquote = () => {
    wrapIn(schema.nodes.blockquote)(state, view.dispatch);
  };

  // Fonctions pour les listes
  const toggleBulletList = () => {
    wrapIn(schema.nodes.bullet_list)(state, view.dispatch);
  };

  const toggleOrderedList = () => {
    wrapIn(schema.nodes.ordered_list)(state, view.dispatch);
  };

  const liftListItem = () => {
    lift(state, view.dispatch);
  };

  // Fonction pour insérer un tableau
  const insertTable = () => {
    const table = schema.nodes.table.create(
      null,
      Array(3).fill(null).map(() =>
        schema.nodes.table_row.create(
          null,
          Array(3).fill(null).map(() =>
            schema.nodes.table_cell.create(
              null,
              schema.nodes.paragraph.create()
            )
          )
        )
      )
    );
    const transaction = state.tr.replaceSelectionWith(table);
    view.dispatch(transaction);
  };

  // Fonction pour insérer une image
  const insertImage = () => {
    const url = window.prompt('URL de l\'image:');
    if (url) {
      const image = schema.nodes.image.create({ src: url });
      const transaction = state.tr.replaceSelectionWith(image);
      view.dispatch(transaction);
    }
  };

  // Fonction pour ajouter un lien
  const addLink = () => {
    if (linkUrl) {
      const link = schema.marks.link.create({ href: linkUrl });
      const transaction = state.tr.addMark(
        state.selection.from,
        state.selection.to,
        link
      );
      view.dispatch(transaction);
      setShowLinkInput(false);
      setLinkUrl('');
    }
  };

  // Fonction pour changer la couleur du texte
  const changeTextColor = (color: string) => {
    const mark = schema.marks.textColor.create({ color });
    const transaction = state.tr.addMark(
      state.selection.from,
      state.selection.to,
      mark
    );
    view.dispatch(transaction);
    setShowColorPicker(false);
  };

  // Fonction pour aligner le texte
  const alignText = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    const mark = schema.marks.textAlign.create({ alignment });
    const transaction = state.tr.addMark(
      state.selection.from,
      state.selection.to,
      mark
    );
    view.dispatch(transaction);
  };

  return (
    <div className="editor-toolbar">
      {/* Formatage du texte */}
      <div className="editor-toolbar-group">
        <button onClick={toggleBold} title="Gras">
          <strong>B</strong>
        </button>
        <button onClick={toggleItalic} title="Italique">
          <em>I</em>
        </button>
        <button onClick={toggleUnderline} title="Souligné">
          <u>U</u>
        </button>
        <button onClick={toggleStrike} title="Barré">
          <s>S</s>
        </button>
        <button onClick={toggleCode} title="Code">
          <code>{'</>'}</code>
        </button>
      </div>

      {/* Titres et paragraphes */}
      <div className="editor-toolbar-group">
        <button onClick={() => setHeading(1)} title="Titre 1">
          H1
        </button>
        <button onClick={() => setHeading(2)} title="Titre 2">
          H2
        </button>
        <button onClick={() => setHeading(3)} title="Titre 3">
          H3
        </button>
        <button onClick={setParagraph} title="Paragraphe">
          P
        </button>
        <button onClick={setCodeBlock} title="Bloc de code">
          {'</>'}
        </button>
        <button onClick={setBlockquote} title="Citation">
          "
        </button>
      </div>

      {/* Listes */}
      <div className="editor-toolbar-group">
        <button onClick={toggleBulletList} title="Liste à puces">
          •
        </button>
        <button onClick={toggleOrderedList} title="Liste numérotée">
          1.
        </button>
        <button onClick={liftListItem} title="Réduire l'indentation">
          ←
        </button>
      </div>

      {/* Alignement du texte */}
      <div className="editor-toolbar-group">
        <button onClick={() => alignText('left')} title="Aligner à gauche">
          ←
        </button>
        <button onClick={() => alignText('center')} title="Centrer">
          ↔
        </button>
        <button onClick={() => alignText('right')} title="Aligner à droite">
          →
        </button>
        <button onClick={() => alignText('justify')} title="Justifier">
          ⇔
        </button>
      </div>

      {/* Liens et couleurs */}
      <div className="editor-toolbar-group">
        <button onClick={() => setShowLinkInput(true)} title="Ajouter un lien">
          🔗
        </button>
        <button onClick={() => setShowColorPicker(!showColorPicker)} title="Couleur du texte">
          🎨
        </button>
      </div>

      {/* Tableaux et Images */}
      <div className="editor-toolbar-group">
        <button onClick={insertTable} title="Insérer un tableau">
          ⊞
        </button>
        <button onClick={insertImage} title="Insérer une image">
          🖼️
        </button>
      </div>

      {/* Popup pour les liens */}
      {showLinkInput && (
        <div className="editor-toolbar-popup">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="URL du lien"
          />
          <button onClick={addLink}>OK</button>
          <button onClick={() => setShowLinkInput(false)}>Annuler</button>
        </div>
      )}

      {/* Popup pour les couleurs */}
      {showColorPicker && (
        <div className="editor-toolbar-popup">
          <div className="color-grid">
            {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map((color) => (
              <button
                key={color}
                className="color-button"
                style={{ backgroundColor: color }}
                onClick={() => changeTextColor(color)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 