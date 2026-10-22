import { blogTagCategory } from '../domain/models/blog-tag.model';

/** Classes Tailwind d'un tag : `tint` pour la pastille de lecture, `solid` pour l'état sélectionné. */
export type BlogTagPalette = { readonly tint: string; readonly solid: string };

// One Orange Rule (DESIGN.md) : une seule teinte pour tout le catalogue, quelle que soit la
// catégorie. Teinte ≤ 8 % sous le texte d'accent, sinon il passe sous 4,5:1 en clair.
// L'aplat clair ne fait que 2,81:1 contre le sable : le contour foreground porte l'état (WCAG 1.4.11).
const SELECTED_TAG_CLASSES = 'bg-primary-bg text-on-primary border-foreground';

const CATALOG_TAG_PALETTE: BlogTagPalette = {
  tint: 'bg-primary/5 text-primary border-primary/30 hover:bg-primary/8',
  solid: SELECTED_TAG_CLASSES,
};

/** Tag hors catalogue (tags projet, saisie libre) : neutre, sélection en couleur primaire. */
const FREE_TAG_PALETTE: BlogTagPalette = {
  tint: 'bg-foreground/8 text-muted border-foreground/20 hover:bg-foreground/15',
  solid: SELECTED_TAG_CLASSES,
};

export function blogTagPalette(tag: string): BlogTagPalette {
  return blogTagCategory(tag) ? CATALOG_TAG_PALETTE : FREE_TAG_PALETTE;
}
