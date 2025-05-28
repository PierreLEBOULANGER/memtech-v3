/**
 * utils.ts
 * Utilitaires pour le frontend
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fonction pour fusionner les classes CSS de manière intelligente
 * Utilise clsx pour la gestion des conditions et tailwind-merge pour éviter les conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 