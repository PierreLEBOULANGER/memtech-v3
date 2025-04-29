/**
 * skeleton.tsx
 * Composant de chargement pour l'interface utilisateur
 * Affiche un placeholder animé pendant le chargement du contenu
 */

import { cn } from "../../lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton } 