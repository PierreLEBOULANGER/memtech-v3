/** @type {import('tailwindcss').Config} */

/*
 * Configuration de Tailwind CSS pour le projet Memtech
 * Ce fichier définit :
 * - Les chemins des fichiers à scanner pour les classes Tailwind
 * - Les thèmes personnalisés (couleurs, polices, etc.)
 * - Les plugins utilisés
 */
export default {
  // Définition des fichiers à scanner pour les classes Tailwind
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // Configuration du thème
  theme: {
    extend: {
      // Palette de couleurs personnalisée
      colors: {
        'tp-yellow': '#FFE600',
        primary: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#121416',
          950: '#090a0b',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        yellow: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
      },
      // Configuration des polices
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'heading': ['Poppins', 'sans-serif'],
      },
      // Configuration des espacements
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      // Configuration des bordures arrondies
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  
  // Plugins Tailwind activés
  plugins: [],
} 