import type { BlogPost } from './models/blog-post.model';
import { PROJECT_TAGS, type ProjectTag } from './models/project-tag.model';

/** Projets que l'article déclare par leur tag, dans l'ordre de ses tags (égalité exacte). */
export function linkedProjects(post: BlogPost | undefined): readonly ProjectTag[] {
  return (post?.tags ?? []).flatMap((tag) => PROJECT_TAGS.filter((entry) => entry.tag === tag));
}
