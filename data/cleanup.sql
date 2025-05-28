-- Suppression des tables obsolètes
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS core_contenureutilisable;
DROP TABLE IF EXISTS core_generationia;
DROP TABLE IF EXISTS core_projet;
DROP TABLE IF EXISTS core_section;
DROP TABLE IF EXISTS core_template;
DROP TABLE IF EXISTS saved_documents;
DROP TABLE IF EXISTS section_contents;
DROP TABLE IF EXISTS section_images;

-- Vérification des contraintes de clés étrangères
PRAGMA foreign_keys = ON; 