---
id: 030
title: Les ADR deviennent des articles de blog, avec un maillage interne
type: feature
status: draft
created: 2026-10-21
related: [specs/029-repositionnement-portfolio-passion.md, docs/adr/0011-themes-du-blog-derives-du-catalogue-de-tags.md, docs/adr/0024-rendu-a-la-requete-des-pages-de-contenu.md, PRODUCT.md]
---

# 030 — Les ADR deviennent des articles de blog

## Description

### Objectif

Demande du propriétaire (2026-10-21) : transformer les ADR en articles de blog. C'est la suite
annoncée par la spec 029 (« Hors périmètre : phase SEO active… transformation des ADR en
articles : spec dédiée »). Le site est un portfolio personnel : un lecteur développeur doit y
trouver du raisonnement technique vérifiable, et non une vitrine commerciale. Les ADR contiennent
déjà ce raisonnement (contexte, options, décision, conséquences), mais ils sont rédigés pour le
dépôt, pas pour un lecteur.

### Arbitrages (2026-10-21)

1. **Périmètre : contenu + maillage.** Des articles tirés des ADR, plus le code qui relie les
   articles entre eux et aux projets. Le reste de la phase SEO (`ProfilePage`, etc.) fera l'objet
   d'une autre spec.
2. **Quatre articles d'abord**, un par groupe d'ADR proches :

   | # | Sujet | ADR sources |
   |---|---|---|
   | A1 | Rendu et performance : du HTML frais sans rebuild | 0024, 0001, 0014 |
   | A2 | Sécurité du contenu : Markdown, images, CSP sans `unsafe-inline` | 0002, 0015, 0018 |
   | A3 | Accessibilité vérifiée en CI dans un vrai navigateur | 0025, 0016, 0017 |
   | A4 | Design system : polices, thème, utilities Tailwind v4 | 0006, 0012, 0003 (avec 0017) |

### Exigences

#### Contenu (A1 à A4)

1. Chaque article est **réécrit pour un lecteur**, pas recopié : le problème de départ, les options
   envisagées, la décision, ce qu'elle coûte, ce qu'elle a donné. Un exemple de code court quand il
   éclaire la décision.
2. **Tout fait est vérifiable** : chaque chiffre, comportement ou en-tête cité est revérifié sur le
   code de `master` ou en production au moment de la rédaction, et non repris de l'ADR sans contrôle
   (plusieurs ADR ont été amendés ou remplacés en partie depuis).
3. Chaque article **cite ses ADR** avec un lien vers le fichier sur GitHub (les dépôts
   `j-ned/ng-portfolio-app` et `j-ned/nest-portfolio-app` sont publics).
4. **Règles éditoriales du site** : aucun mot du verrou `editorial-identity.spec.ts` ni de
   `forbidden-wordings.ts`, aucun appel commercial. La fin d'un article renvoie vers le code, l'ADR
   et un autre article, pas vers une prestation.
5. **Tags** pris dans le catalogue (ADR-0011) pour que chaque article tombe dans un thème. Les tags
   manquants (voir Constat 4) sont ajoutés au catalogue, dans le bon thème.
6. Les brouillons sont relus en PR (`docs/articles/`) avant publication. La publication se fait par
   l'admin ; le slug, généré par l'API au premier enregistrement, est ensuite figé.

#### Maillage (code)

7. **Article → articles** : la page d'un article propose jusqu'à trois autres articles publiés,
   choisis par proximité (tags et thème partagés), **dans le HTML servi** (rendu à la requête,
   ADR-0024), et non ajoutés par le navigateur après coup.
8. **Article ↔ projet** : un article qui parle d'un projet renvoie vers sa fiche, et la fiche du
   projet liste les articles publiés qui le concernent. Comment un article « déclare » son projet
   (tag, champ, convention) est à décider dans le plan technique.
9. Les données structurées restent `BlogPosting` (déjà en place) ; le plan technique dit si les liens
   ci-dessus doivent aussi y apparaître (`isBasedOn` vers l'ADR, `about` vers le projet, etc.).
10. Aucune régression : AXE à zéro violation (ADR-0025), verrou éditorial vert, pages de contenu
    toujours rendues à la requête sans rebuild.

### Constat (2026-10-21, `master` `ec11541`)

1. 28 ADR, de 280 à 1 650 mots. Les ADR 0005 et 0026 à 0028 sont obsolètes (spec 029) et ne
   seront jamais publiés. Plusieurs ADR utiles ne sont plus à jour seuls : 0003 est remplacé en partie
   par 0017, 0015 est amendé par 0018, 0024 amende 0023. Les ADR 0016 et 0018 sont encore au
   statut « proposé », alors qu'ils sont appliqués : `shared/ui/field-error.ts` est utilisé dans
   17 fichiers, et nginx relaie `/api/storage/` depuis l'origine du site (`Dockerfile`, bloc
   `location ^~ /api/storage/`). Leur statut est à passer à « accepté » avant de les citer.
2. Le format marche déjà : l'article « Mesurer la fréquentation de son site sans cookie ni bandeau
   de consentement » (publié le 2026-10-18) est tiré des ADR 0021 et 0022.
3. La page d'un article (`features/blog/pages/blog-detail/blog-detail.ts`) émet un JSON-LD
   `BlogPosting` (auteur, dates, mots-clés). Elle ne propose aucun autre article ni aucun projet :
   un lecteur arrivé de Google repart sans lien vers la suite. La fiche projet (`CreativeWork`) ne
   cite aucun article.
4. Le catalogue de tags (`features/blog/domain/models/blog-tag.model.ts`) n'a ni « Performance »,
   ni « SSR », ni « Accessibilité », ni « CSP », ni « Design system », ni « Tailwind CSS ».
   L'API accepte des tags libres (15 au plus) : un tag hors catalogue reste neutre et ne compte
   dans aucun thème (ADR-0011).
5. Les projets ont leurs propres tags (`project.tags`, côté API), sans lien avec ceux du blog.

### Découpage en PR

| # | Dépôt | Périmètre | Dépend de |
|---|---|---|---|
| 1 | front | cette spec (Description) | — |
| 2 | front | plan technique (`architect`), ADR si décision structurante | 1 |
| — | admin (donnée, sans PR) | **avant le déploiement de 3** : fiche projet « Portfolio » créée en production (slug attendu `portfolio`, vérifié par `GET /api/projects` avant le merge de 3) | 1 |
| 3 | front seul (aucune évolution d'API, ADR-0029) | maillage : tags ajoutés, articles proches, lien article ↔ projet, données structurées | 2, fiche « Portfolio » en production |
| — | admin (donnée, sans PR) | tag « Candidash » de l'article sur la mesure d'audience corrigé en « CandiDash » (après le déploiement de 3 ; avant, sans effet) | 3 |
| 4 à 7 | front | un brouillon par PR (`docs/articles/`, gabarit au plan technique), puis publication par l'admin, un par semaine | 3 pour les liens, sinon 1 |

Les articles peuvent être rédigés pendant que le maillage se code : seule leur publication gagne à
attendre la PR 3.

### Hors périmètre

- `ProfilePage`, refonte des titres et descriptions, `llms.txt` : autre spec SEO.
- Les autres ADR (0004, 0007 à 0011, 0013, 0019 à 0023) : candidats d'une deuxième vague, choisis
  après la mesure d'audience des quatre premiers articles.
- Traduction anglaise, newsletter, série d'articles numérotée.

### Arbitrages complémentaires (2026-10-21)

1. **Brouillons dans le dépôt** : un fichier par article dans `docs/articles/` (par exemple
   `docs/articles/030-a1-rendu-et-performance.md`), relu en PR, puis collé dans l'admin. L'historique
   et les faits vérifiés restent traçables.
2. **Un article par semaine**, dans l'ordre A1 à A4 (modifiable). La mesure d'audience de chaque
   article informe la rédaction du suivant.

## Plan technique — PR 3 (maillage, front seul)

Périmètre : exigences 5 (tags), 7 (articles proches), 8 (article ↔ projet), 9 (données
structurées), 10 (non-régression). La rédaction des articles est hors de ce plan, sauf le gabarit de
brouillon (fin de section). Décision structurante : **ADR-0029**.

### Arbitrages du propriétaire (2026-10-21)

1. **Fiche « Portfolio » : oui.** Le propriétaire crée dans l'admin une fiche projet pour le
   portfolio ; A1 à A4 y sont rattachés par le tag catalogue `Portfolio`. Slug attendu `portfolio`
   (l'API le dérive du titre par `slugify` : minuscules, sans diacritiques, `[^a-z0-9]+` → `-`) ;
   la valeur réelle se lit par `GET /api/projects` **avant le merge** de la PR 3 et remplace
   l'attendue si elle diffère. La fiche doit exister en production **avant** le déploiement de la
   PR 3, sinon le lien « Fiche du projet » des articles tagués `Portfolio` mène à une 404.
   Vérifié : `Portfolio` n'est ni dans le catalogue, ni dans `FORBIDDEN_WORDINGS`, ni dans les motifs
   de `editorial-identity.spec.ts` ; ses seules occurrences dans `src/` sont des données de test de
   l'audience admin (`analytics-builders.ts`, `admin-audience.spec.ts`), sans lien avec les tags.
2. **Tag « Candidash » → « CandiDash »** sur l'article mesure d'audience : correction de donnée dans
   l'admin, après le déploiement de la PR 3 (avant, sans effet). Ligne gardée au découpage.
3. **Précédent / suivant gardés** à côté des articles proches, doublons autorisés (D1 inchangé).
4. **`SSR` reste dans Stack** (D8 inchangé).
5. **Textes validés** : « Pour aller plus loin », « Articles sur ce projet », sur-titre « Fiche du
   projet ».

### Faits vérifiés (2026-10-21)

- `BlogDetail` charge déjà la liste publiée (`toSignal(gateway.getPublishedPosts())`) pour
  `adjacentPosts` ; la navigation « article précédent / suivant » est dans le HTML servi (vérifié en
  production, `data-testid="newer-post"` présent). Les articles proches se calculent sur cette liste :
  **zéro appel d'API ajouté** sur la page article.
- `GET /api/blog/posts` renvoie chaque article avec son `contentMarkdown` ; état de transfert d'une
  page article en production : 47 566 octets de `ng-state` pour 3 articles. Fiche projet : 27 452.
- `ProjectDetail` lit `ProjectsGateway.getAllProjects()` (liste partagée en session) par `rxResource`.
- `ssrUpstreamInterceptor` passe la réponse en 503 sur toute lecture en échec (hors 404) : tout appel
  ajouté au rendu est une cause de 503 de plus (nginx sert alors sa copie).
- Projets en production : `dashflow`, `candidash`, `le-vieux-comptoir`, `coaching-life`,
  `labelsync-pro`, `gitpush-auto`. Le portfolio n'a pas encore de fiche (créée par le propriétaire, arbitrage 1). Tags des articles publiés :
  `DashFlow` (catalogue, thème Projets) sur l'article chiffrement, `Candidash` (tag libre, casse
  différente du titre `CandiDash`) sur l'article mesure d'audience.
- API : `cta_click` accepte un `entityId` libre (aucune règle dans `ENTITY_ID_RULES`) ; les clics se
  mesurent sans évolution d'API.
- Précédents réutilisés : `adjacentPosts(posts, slug)` (signature et tri), `blogTagCategory`,
  `SplitSection` (sections de la fiche projet), `ProjectDetailHeader (linkClicked)` (le dumb émet, la
  page mesure), `stubBlogGateway`, `makeBlogPost`, `makeProject`.

### Décisions

| # | Décision | Alternatives écartées |
|---|---|---|
| D1 | **Articles proches calculés côté front** par une fonction pure `relatedPosts(posts, slug)` sur la liste déjà chargée. Score = tags partagés + thèmes partagés (catégories non nulles communes) ; score nul exclu ; tri score ↓, `publishedAt` ↓, `slug` ↑ ; `RELATED_POSTS_LIMIT = 3`. Pas d'exclusion des voisins chronologiques. | Endpoint API `related` (duplique le catalogue, appel de plus) ; calcul après hydratation (absent du HTML). |
| D2 | **Un article déclare son projet par un tag du catalogue** : table `PROJECT_TAGS` (`tag` → `projectSlug`) dans le domaine blog ; la catégorie `projects` du catalogue **dérive** de cette table (tag de projet = tag du catalogue par construction). Entrées : `DashFlow → dashflow`, `CandiDash → candidash`, `Portfolio → portfolio` (arbitrage 1). Une entrée s'ajoute avec le premier article sur un nouveau projet. | Colonne `blog_post.project_id` (PR API + migration + admin pour 3 projets, seuil dans ADR-0029) ; correspondance tag = titre à l'exécution (appel projets sur chaque article, casse fragile) ; `project.tags` (stack, relie tout à tout). |
| D3 | **La page article n'appelle pas l'API des projets** : le lien se construit depuis `PROJECT_TAGS` (le tag est le nom affiché). | Charger les projets pour valider le slug : une cause de 503 de plus pour éviter un cas (slug renommé) déjà accepté par ADR-0019. |
| D4 | **La fiche projet lit la liste du blog seulement si son slug est dans `PROJECT_TAGS`** : `rxResource({ params: () => projectTagOf(slug) ?? undefined, stream: … })` ; `undefined` laisse la ressource inactive, donc aucune requête ni `ng-state` en plus sur les fiches sans tag. Lecture en échec : section absente côté navigateur ; côté serveur, l'intercepteur pose déjà le 503. | Charger toujours (`ng-state` alourdi de ~15 Ko par article sur toutes les fiches) ; état d'erreur visible (contenu secondaire, la fiche reste lisible). |
| D5 | **JSON-LD** : `BlogPosting.about` = projets liés (`{ '@type': 'CreativeWork', name, url: <site>/projects/<slug> }`), clé absente sans projet ; `CreativeWork.subjectOf` = articles du projet (`{ '@type': 'BlogPosting', headline, url: <site>/blog/<slug> }`), clé absente sans article. | `isBasedOn` vers les ADR (donnée absente de l'API, sans effet sur les résultats enrichis ; les ADR sont cités dans le corps) ; articles proches dans le JSON-LD (`relatedLink` est une propriété de `WebPage`, valeur nulle). |
| D6 | **Les clics de maillage sont mesurés** par `trackCtaClick` existant, trois identifiants fixes : `blog_related_post`, `blog_project_link`, `project_article`, libellés constants (pas le titre de la cible). Raison : la mesure de chaque article doit informer le suivant (arbitrage 2), et une page vue interne ne porte pas sa provenance (le `referrer` n'est envoyé qu'à la première page vue, `http-analytics.gateway.ts`) : sans événement, impossible de savoir si le maillage sert. | Ne rien mesurer (le maillage resterait invérifiable) ; nouveau type d'événement (évolution d'API pour un besoin couvert par `cta_click`). |
| D7 | **Carte de lien partagée** `shared/ui/link-card.ts`, composant à sélecteur d'attribut `a[app-link-card]` (sur-titre + titre), qui reprend le visuel des cartes « article précédent / suivant » de `BlogDetail`. `routerLink` et `data-testid` restent sur l'`<a>`. Utilisée par la navigation chronologique (refactor), les articles proches, le lien projet et les articles d'un projet. | Dupliquer les classes dans 4 gabarits (règle « structure réutilisée = composant `shared/ui/` ») ; directive d'attribut seule (les deux `span` internes resteraient dupliqués) ; composant élément enveloppant l'`<a>` (`data-testid` et `routerLink` déportés, tests existants à réécrire). |
| D8 | **Tags ajoutés au catalogue** (exigence 5) : `Performance`, `Accessibilité`, `Design system` → `engineering` ; `CSP` → `security` ; `SSR`, `Tailwind CSS` → `stack` ; `CandiDash`, `Portfolio` → `projects` (via `PROJECT_TAGS`). `SSR` en Stack confirmé par le propriétaire (arbitrage 4). | `SSR` en `engineering` (défendable, écarté par le propriétaire). |
| D9 | **Aucune évolution d'API.** Seuils de migration (colonne `project_id`, liste allégée sans Markdown) consignés dans ADR-0029. | — |

### Architecture

```
BlogDetail (page, smart)
  ├─ _publishedPosts (liste déjà chargée) ─┬─ adjacentPosts  → nav « Autres articles » (LinkCard)
  │                                        └─ relatedPosts   ─┐
  ├─ post() ── linkedProjects(PROJECT_TAGS) ──────────────────┼→ BlogFurtherReading (dumb) ─(projectFollowed | postFollowed)→ trackCtaClick
  └─ _applySeo : BlogPosting + about                          ┘

ProjectDetail (page, smart)
  ├─ _projectsResource (inchangé)
  ├─ _postsResource : rxResource, params = projectTagOf(slug) ?? undefined → BlogGateway.getPublishedPosts()
  │     └─ postsAboutProject(posts, slug) → ProjectArticles (dumb, SplitSection + LinkCard) ─(articleFollowed)→ trackCtaClick
  └─ _applyProjectSeo : CreativeWork + subjectOf
```

- Dérivations = **fonctions pures du domaine blog** (`features/blog/domain/**`), testées sans
  TestBed ; les pages ne font que `computed(() => fn(...))`. Pas de presenter : aucune page ne mêle
  DOM et dérivation non triviale au-delà de l'existant (règle « une API à un seul site »).
- Dépendance inter-feature : `ProjectDetail` et `ProjectArticles` importent le domaine blog
  (`BlogGateway`, `BlogPost`, `PROJECT_TAGS`, `postsAboutProject`). Précédent : `BlogDetail` importe
  `AnalyticsGateway` du domaine analytics. Le blog possède la relation (le tag est une notion du blog).
- **Landmarks** : `BlogFurtherReading` = `<section aria-labelledby>` + `h2`, hors `<article>`,
  entre la barre « J'aime / Flux RSS » et la `nav` « Autres articles » ; aucun `nav` ajouté (la page en
  a déjà un, libellé « Autres articles »). `ProjectArticles` = `SplitSection` (`section` + `h2`),
  après « Décisions d'architecture », avant `app-project-detail-nav`. Aucun `header`/`footer`/`main`.
- **SSR** : aucun `@defer`, aucun `afterNextRender` ; les deux blocs se rendent au serveur avec les
  données lues par `HttpClient` (tâches en attente) et réutilisées à l'hydratation (transfer cache).
- `ProjectDetail` passe à 7 collaborateurs injectés (seuil indicatif 6) : `BlogGateway` est la seule
  source de la liste ; `PLATFORM_ID` et `RESPONSE_INIT` (via `injectMarkNotFound`) sont de
  l'infrastructure. Accepté, sans facade (une facade pour une ressource serait de l'indirection).

### Fichiers

À créer :

| Fichier | Rôle |
|---|---|
| `src/app/features/blog/domain/models/project-tag.model.ts` | `ProjectTag`, `PROJECT_TAGS` (`as const satisfies`), `ProjectBlogTag` dérivé, `projectTagOf(projectSlug)` |
| `src/app/features/blog/domain/related-posts.ts` | `relatedPosts(posts, slug)`, `RELATED_POSTS_LIMIT` |
| `src/app/features/blog/domain/linked-projects.ts` | `linkedProjects(post)` : entrées de `PROJECT_TAGS` portées par l'article, dans l'ordre de ses tags |
| `src/app/features/blog/domain/posts-about-project.ts` | `postsAboutProject(posts, projectSlug)` : articles publiés portant le tag du projet, `publishedAt` ↓ |
| `src/app/shared/ui/link-card.ts` | `a[app-link-card]`, entrées `overline`, `heading`, `align: 'start' \| 'end'` |
| `src/app/features/blog/application/components/blog-further-reading.ts` | Section « Pour aller plus loin » (dumb) : `projects`, `posts`, sorties `projectFollowed` et `postFollowed` (`output()`, livrées en tranches 2 et 3) |
| `src/app/features/blog/application/further-reading-copy.ts` | `FURTHER_READING_COPY` : titre de section, sur-titre « Fiche du projet », libellés de mesure |
| `src/app/features/projects/application/components/project-articles.ts` | Section « Articles sur ce projet » (dumb, `SplitSection`) : `posts`, sortie `articleFollowed: output<void>()` |
| `src/app/features/projects/application/project-articles-copy.ts` | `PROJECT_ARTICLES_COPY` : titre, résumé, libellé de mesure |

Tests (écrits par `qa`) : `*.spec.ts` à côté de chaque fichier ci-dessus, plus les specs existants
de `blog-detail`, `project-detail`, `blog-tag.model`.

À modifier :

| Fichier | Changement |
|---|---|
| `src/app/features/blog/domain/models/blog-tag.model.ts` | Tags D8 ; catégorie `projects` = `[...PROJECT_TAGS.map((p) => p.tag), 'Auto-hébergement', 'CI/CD', 'GreenTech']` |
| `src/app/features/blog/pages/blog-detail/blog-detail.ts` | `related`, `linked` (`linkedProjects`) en `computed` ; `<app-blog-further-reading>` ; cartes précédent/suivant en `a[app-link-card]` ; `about` dans le JSON-LD ; `trackCtaClick` sur `projectFollowed` / `postFollowed` |
| `src/app/features/projects/pages/project-detail/project-detail.ts` | `inject(BlogGateway)`, `_postsResource` (D4), `articles` en `computed` ; `<app-project-articles>` ; `subjectOf` dans le JSON-LD ; `trackCtaClick` sur `articleFollowed` |
| `src/app/testing/editorial-sources.ts` | Enregistre `FURTHER_READING_COPY` et `PROJECT_ARTICLES_COPY` (verrou éditorial) |
| `ci/api-stub/fixtures/projects.json` | Projet `dashflow` minimal (slug réel de `PROJECT_TAGS`) |
| `ci/api-stub/fixtures/blog-posts.json` | `article-temoin` reçoit le tag `DashFlow` ; nouvel article publié `article-voisin` (tag `Angular`) |
| `e2e/a11y/scenarios.ts` | Scénario `/projects/dashflow`, prêt sur `project-articles` |
| `DESIGN.md` | Trois fiches (voir « DESIGN.md ») |

### Modèles de données

```ts
// features/blog/domain/models/project-tag.model.ts
export type ProjectTag = { readonly tag: string; readonly projectSlug: string };

export const PROJECT_TAGS = [
  { tag: 'DashFlow', projectSlug: 'dashflow' },
  { tag: 'CandiDash', projectSlug: 'candidash' },
  { tag: 'Portfolio', projectSlug: 'portfolio' },
] as const satisfies readonly ProjectTag[];

export type ProjectBlogTag = (typeof PROJECT_TAGS)[number]['tag'];
export function projectTagOf(projectSlug: string): ProjectBlogTag | null;
```

- Tout est `readonly` ; les fonctions rendent de nouveaux tableaux (`filter` avant `sort`, comme
  `adjacentPosts`), jamais de mutation de l'entrée.
- **Contrainte structurelle encodée dans les types** : un tag de projet est un tag du catalogue
  rangé dans `projects` parce que la catégorie est construite depuis `PROJECT_TAGS` (pas de test
  runtime « le tag existe-t-il ? ») ; `ProjectBlogTag` est une union littérale dérivée.
- Égalité de tag **exacte** (même règle que `blogTagCategory`) : `Candidash` ne vaut pas `CandiDash`.
- Aucune donnée d'API nouvelle, aucun type `infra` touché. Validation runtime aux frontières non
  vérifiée (profil : pas de lib côté front), inchangé.

### Réactivité et chargement (SSR)

- `BlogDetail` : `protected readonly related = computed(() => relatedPosts(this._publishedPosts(), this.slug()))`,
  `protected readonly linked = computed(() => linkedProjects(this.post()))` (liste vide sans
  article). Aucune nouvelle source asynchrone.
- `ProjectDetail` : `_postsResource = rxResource({ params: () => projectTagOf(this.slug()) ?? undefined, stream: () => this._blogGateway.getPublishedPosts() })` ;
  `articles = computed(() => this._postsResource.hasValue() ? postsAboutProject(this._postsResource.value(), this.slug()) : [])`.
  Jamais `.value()` sans `hasValue()` (une ressource en erreur lève à la lecture).
- JSON-LD : les `effect` SEO existants lisent `projects()` / `articles()` et se rejouent quand la
  liste arrive ; le HTML servi porte l'état final (`Seo` remplace le script `ld+json`).
- Instance réutilisée entre deux slugs (`/blog/a` → `/blog/b`, `/projects/x` → `/projects/y`) : tout
  est dérivé de `slug()`, rien à réinitialiser.

### Tranches

- **Tranche 1 — les tags manquants tombent dans leur thème** : `blog-tag.model.ts` (D8, sans
  `CandiDash`). Tests domaine sans TestBed : `blogTagCategory` de chaque tag ajouté (`it.each`),
  `AVAILABLE_BLOG_TAGS` sans doublon, un article tagué `Accessibilité` compte dans `engineering`
  (`countPostsByCategory`).
- **Tranche 2 — la page article propose jusqu'à trois articles proches dans le HTML rendu** :
  `related-posts.ts`, `link-card.ts`, `blog-further-reading.ts` (articles seuls), `further-reading-copy.ts`,
  branchement dans `BlogDetail`, clic mesuré (`blog_related_post`), copie enregistrée au verrou
  éditorial. Tests : domaine (score, exclusion de l'article courant, des brouillons et des scores
  nuls, tri, limite à 3 ; candidat aux propriétés, skill `angular-property-testing`) ; composant
  `BlogDetail` (section absente sans article proche, `h2`, liens `/blog/<slug>`, **un seul appel**
  à `getPublishedPosts`, `trackCtaClick` au clic) ; `LinkCard` (sur-titre, titre, `align`). Refactor
  sous vert par `angular-expert` : cartes précédent / suivant passées en `a[app-link-card]`, tests
  existants inchangés.
- **Tranche 3 — un article renvoie vers la fiche de son projet** : `project-tag.model.ts`
  (`PROJECT_TAGS`, `projectTagOf`, catégorie `projects` dérivée, `CandiDash` et `Portfolio` ajoutés),
  `linked-projects.ts`, partie projet de `BlogFurtherReading` (avant les articles, sur-titre « Fiche
  du projet », titre = tag), clic mesuré (`blog_project_link`). Tests : domaine (`linkedProjects`,
  `projectTagOf`, tout tag de `PROJECT_TAGS` est en `projects`) ; composant (lien
  `/projects/dashflow` présent pour un article tagué `DashFlow`, `/projects/portfolio` pour
  `Portfolio`, absent pour `Candidash`).
- **Tranche 4 — la fiche projet liste les articles qui la concernent** : `posts-about-project.ts`,
  `project-articles.ts`, `project-articles-copy.ts`, `ProjectDetail` (D4), clic mesuré
  (`project_article`), fixtures de la doublure et scénario a11y `/projects/dashflow`. Tests : domaine
  (filtre publié + tag, tri) ; composant (`ProjectDetail` sur `dashflow` : section et liens ;
  sur `mon-site` : **aucun appel** à `getPublishedPosts` ; lecture en échec : fiche rendue sans la
  section). Le `setup` existant de `project-detail.spec.ts` reçoit `stubBlogGateway()` (fait par `qa`).
- **Tranche 5 — les liens figurent dans les données structurées** : `about` (`BlogDetail`) et
  `subjectOf` (`ProjectDetail`). Tests composant sur l'argument de `Seo.applySeoData` : présence avec
  un projet / des articles, **absence de la clé** sinon (`it.each`).

Chaque tranche se ferme par `pnpm test` (lire `$?`) et `pnpm lint` ; la PR par les gates du
Dockerfile (`pnpm install --frozen-lockfile`, `pnpm run build --configuration production`) et le job
`a11y` (zéro violation, clair et sombre, nouveaux scénarios compris).

### DESIGN.md (fiches à ajouter, tranches 2 et 4)

- **Carte de lien (`shared/ui/link-card.ts`)** : `a[app-link-card]` ; carte « Cards / Containers »
  (`rounded-xl border border-foreground/8 bg-surface p-6`), survol par la bordure (`hover:border-primary/35`)
  et le titre en `primary` (`group-hover`), pas d'ombre ; sur-titre mono `text-xs text-muted`, titre
  `text-[1.1875rem] font-semibold tracking-tight` ; `align="end"` aligne à droite ; focus visible
  ring 2 px `primary`. Une seule cible par carte.
- **Pour aller plus loin (`features/blog/application/components/blog-further-reading.ts`)** :
  section titrée `h2`, hors de l'`article`, sous la barre « J'aime / Flux RSS » ; fiche du projet
  d'abord, puis jusqu'à trois articles proches, en grille `sm:grid-cols-2` ; sur-titre = date de
  publication pour un article, « Fiche du projet » pour un projet ; non rendue quand elle est vide.
- **Articles d'un projet (`features/projects/application/components/project-articles.ts`)** :
  `SplitSection` comme « Choix techniques » et « Décisions d'architecture », avant la navigation
  entre projets ; une `LinkCard` par article (sur-titre = date), du plus récent au plus ancien ; non
  rendue sans article.

### Gabarit d'un brouillon (`docs/articles/030-aN-<slug>.md`, PR 4 à 7)

```yaml
---
id: 030-a1
titre: "…"                # 200 caractères au plus (DTO API)
extrait: "…"              # 300 au plus ; les 155 premiers font la meta description (truncateAtWord)
tags: [SSR, Performance, Angular]   # catalogue uniquement (blog-tag.model.ts), 15 au plus
projet: Portfolio         # un tag de PROJECT_TAGS (Portfolio, DashFlow, CandiDash) ou aucun : à mettre aussi dans `tags`
adr: [docs/adr/0024-rendu-a-la-requete-des-pages-de-contenu.md]   # liens GitHub dans le corps
faits-verifies: 2026-10-2x sur master <sha> / en production
statut: brouillon         # brouillon | relu | publié
slug: ""                  # rempli après publication (généré par l'API, figé ensuite)
---
```

Le rattachement à un projet passe **uniquement** par le tag (ADR-0029) : `projet` sert à la relecture.

### Risques et inconnues

- **Fiche « Portfolio » et slug** : déployer la PR 3 avant que la fiche existe, ou avec un slug
  différent de `portfolio`, publie un lien 404 sur chaque article tagué `Portfolio` ; renommer plus
  tard le titre de la fiche change son slug (`slugify` au `PATCH`) et casse le lien de la même façon.
  Contrôle avant merge : `GET /api/projects` contient le slug de `PROJECT_TAGS`.
- **Poids de l'état de transfert** : les fiches `dashflow`, `candidash` et `portfolio` embarquent la liste du blog
  (~15 Ko par article, Markdown compris) ; la page article l'embarque déjà et franchira ~100 Ko vers
  7 articles publiés, indépendamment de cette spec : seuil de la liste allégée côté API (ADR-0029).
- **Articles proches bruités** : les tags génériques (`Angular`, `TypeScript`) rapprochent presque
  tout ; le score ne départage qu'avec des tags spécifiques, d'où l'exigence 5. La formule (poids
  égal tag / thème) parie que les articles portent au moins un tag spécifique : à revoir sur pièce
  après A2 si les propositions sont mauvaises.

## Plan de test

### Tranche 1 — les tags manquants tombent dans leur thème

Tags D8 hors projets (`CandiDash` et `Portfolio` arrivent en tranche 3 avec `PROJECT_TAGS`). Tests
ajoutés aux tables `it.each` existantes, domaine pur sans TestBed.

`src/app/features/blog/domain/models/blog-tag.model.spec.ts`, `blogTagCategory` (6 lignes ajoutées) :

| Tag | Assertion |
|---|---|
| `Performance` | `toBe('engineering')` |
| `Accessibilité` | `toBe('engineering')` |
| `Design system` | `toBe('engineering')` |
| `CSP` | `toBe('security')` |
| `SSR` | `toBe('stack')` |
| `Tailwind CSS` | `toBe('stack')` |

`AVAILABLE_BLOG_TAGS` sans doublon : couvert par le test existant « flattens every category without
duplicates » (taille de la liste = taille du `Set` = somme des catégories), vert avant et après ; il
attrape un tag D8 ajouté deux fois. Pas de doublon de test.

`src/app/features/blog/domain/count-posts-by-category.spec.ts`, ligne ajoutée à la table :
« a post tagged Accessibilité » → `toEqual({ ...ZERO, engineering: 1 })`.

Sweep : aucun test existant n'encode `Performance`, `Accessibilité`, `Design system`, `CSP`, `SSR`
ou `Tailwind CSS` comme tag libre (seul `SSR` apparaît, dans `admin-project-form-data.ts`, stack de
projet sans lien avec le catalogue) ; aucun comptage figé du catalogue (`blog-tag-palette.spec.ts`
itère sur `BLOG_TAGS_BY_CATEGORY`).

RED confirmé via la commande test du profil (`pnpm test`, après `ng cache clean` et purge de
`node_modules/.vite`) le 2026-10-21 19:05, 7 failed / 3959 total ; code de sortie 1. Les 7 échecs
sont des assertions comportementales (`expected null to be 'engineering' | 'security' | 'stack'`,
`engineering: 0` au lieu de 1) ; aucune erreur de type, de format ni de harnais ; les 3952 autres
tests restent verts (213 fichiers sur 215).

```
 Test Files  2 failed | 213 passed (215)
      Tests  7 failed | 3952 passed (3959)
```

### Tranche 2 — la page article propose jusqu'à trois articles proches dans le HTML rendu

Profil sans champ `Property-based` et `fast-check` absent des dépendances : pas de test par
propriétés (doctrine `qa` : profil muet ⇒ n'en introduis pas) ; les invariants (exclusions, tri,
limite, entrée non mutée) sont épinglés par l'exemple. `BlogFurtherReading` n'a pas de spec isolé :
composant présentationnel couvert par `BlogDetail` (règle de frontière `qa`) ; `FURTHER_READING_COPY`
est couvert par le `h2`, la mesure du clic et le verrou éditorial.

Contrat posé par les tests, non nommé au plan : `data-testid="further-reading"` sur la `section`,
`data-testid="related-post"` sur chaque `a[app-link-card]` d'article proche, clé
`FURTHER_READING_COPY.heading` (« Pour aller plus loin ») et `FURTHER_READING_COPY.relatedPostCtaLabel`
(libellé de mesure, chaîne non vide, valeur laissée au GREEN). Le contenu de `LinkCard` se lit par
ses deux enfants dans l'ordre (sur-titre puis titre), sans `data-testid` interne.

`src/app/features/blog/domain/related-posts.spec.ts` (18 tests, sans TestBed, `makeBlogPost`) :

| Test | Scénario | Assertion clé |
|---|---|---|
| limite | constante | `RELATED_POSTS_LIMIT` `toBe(3)` |
| proposé (`it.each` × 3) | tag du catalogue partagé ; tag libre partagé ; thème seul partagé | `['candidat']` |
| écarté (`it.each` × 5) | ni tag ni thème ; tags libres différents ; casse différente ; candidat sans tag ; courant sans tag | `[]` |
| pas de soi-même | courant et voisin de mêmes tags | `['voisin']` |
| brouillon | brouillon de mêmes tags, publié de thème commun | `['publie']` |
| slug absent | slug inconnu | `[]` |
| score d'abord | scores 4, 2, 1 aux dates inverses | ordre par score |
| thème compté une fois | 3 tags Stack contre 1 tag Sécurité, plus récent | `['un-tag-securite', 'plusieurs-tags-stack']` |
| poids égal tag / thème | tag libre seul contre thème seul, plus récent | `['theme', 'tag-libre']` |
| départage par slug | même score, même date | `['a', 'b', 'c']` |
| limite à 3 | 5 candidats | `['fort-2', 'fort-1', 'moyen']` (score puis date) |
| entrée intacte | liste gelée (`Object.freeze`) | résultat trié, entrée inchangée, aucun `TypeError` |

`src/app/shared/ui/link-card.spec.ts` (4 tests, hôtes de test, `provideRouter([])`) :

| Test | Scénario | Assertion clé |
|---|---|---|
| contenu | `routerLink` `/projects/dashflow`, sur-titre, titre | `<a>`, `href` conservé, enfants `['Fiche du projet', 'DashFlow']` |
| aspect par défaut | sans `align` | classes de carte DESIGN.md sur l'hôte, pas de `text-right` |
| `align="end"` | aligné à droite | classes de carte + `text-right` |
| réactivité | entrées liées à des signaux, modifiées | nouveaux textes, `text-right` retiré |

`src/app/features/blog/pages/blog-detail/blog-detail.spec.ts`, `describe('pour aller plus loin')`
(7 tests ; le `setup` reçoit `trackCtaClick: vi.fn()` dans la doublure d'analytics, aucune valeur
attendue existante modifiée) :

| Test | Scénario | Assertion clé |
|---|---|---|
| absente | seul autre article sans rapport (aussi voisin chronologique) | `further-reading` `null`, `older-post` présent |
| structure | un article proche | `SECTION`, `h2` « Pour aller plus loin », `aria-labelledby` = id du `h2`, hors `article`, après l'article et avant la `nav` « Autres articles » |
| liens | 4 proches | 3 `href` `/blog/<slug>` par score puis date, titres, sur-titre portant jour et année de publication |
| doublon permis | voisin précédent = proche | `older-post` et `related-post` vers `/blog/voisin` |
| un seul appel | page chargée | `getPublishedPosts` appelé 1 fois |
| changement de slug | instance réutilisée `courant` → `parcours` | proches recalculés, `getPublishedPosts` toujours 1 fois |
| clic mesuré | 2 proches cliqués | `trackCtaClick('blog_related_post', FURTHER_READING_COPY.relatedPostCtaLabel)` × 2, libellé non vide, `navigateByUrl` vers `/blog/deux-tags` puis `/blog/un-tag` |

Verrou éditorial : `src/app/testing/editorial-sources.ts` enregistre `FURTHER_READING_COPY`
(lignes ajoutées aux tables de `editorial-identity.spec.ts` et `editorial-typography.spec.ts`).
Les hôtes de `link-card.spec.ts` portent `eslint-disable-next-line
@angular-eslint/template/elements-content` : la règle ne voit pas le texte rendu par le gabarit de
`LinkCard` (voir le signalement au GREEN ci-dessous).

Sweep : aucun test existant n'encode `relatedPosts`, `LinkCard`, `further-reading`, `related-post`
ou `blog_related_post` ; le seul effet sur l'existant est la doublure d'analytics de `blog-detail.spec.ts`
(méthode ajoutée). Aucun état seedé dont la sémantique change ; aucune constante recalibrée.

Tous les tests de cette tranche échouent à ce stade (RED confirmé via la commande test du profil
le 2026-10-21 19:16, 22 failed / 4012 total). Nature des échecs : sur l'arbre réel, `pnpm test`
(après `ng cache clean` et purge de `node_modules/.vite`) s'arrête à la compilation, uniquement sur
des symboles applicatifs dus au GREEN : `TS2307` `./related-posts`, `./link-card`,
`../../application/further-reading-copy` et `@features/blog/application/further-reading-copy` ;
`NG1010` sur les deux hôtes de `link-card.spec.ts`, qui découle de `./link-card` absent. Aucune
faute de type propre aux specs ; prettier et eslint verts sur les 4 fichiers touchés ; le motif
d'archéologie ne trouve rien. Mesure du rouge comportemental : squelette jetable posé le temps d'une
exécution puis retiré (`RELATED_POSTS_LIMIT = 0`, `relatedPosts` à `[]`, copies vides, `LinkCard`
aux bonnes entrées et au gabarit vide, `BlogDetail` inchangé) : 22 failed / 4012 total, toutes en
`AssertionError` (12 domaine, 4 `LinkCard`, 6 `BlogDetail`). Verts par nature sous le squelette
(7) : les 5 cas « écarté », le slug absent, la section absente. Harnais vérifié : une implémentation
jetable complète (domaine, carte, copie, section branchée dans `BlogDetail`) donne 4012 passed /
4012, code de sortie 0 ; avec la même implémentation mais `BlogDetail` inchangé, 6 failed / 4012
(les 6 tests de page). Tout a été retiré (`git checkout` de `blog-detail.ts`, fichiers créés
supprimés ; `git status` ne montre que les specs). Non-régression : 4012 = 3959 + 53 tests ajoutés
(18 domaine, 4 carte, 7 page, 24 lignes de verrou éditorial) ; aucun test des tranches antérieures
ne tombe.

```
 Test Files  3 failed | 214 passed (217)
      Tests  22 failed | 3990 passed (4012)
```

Dû au GREEN : `src/app/features/blog/domain/related-posts.ts` (`relatedPosts`,
`RELATED_POSTS_LIMIT`), `src/app/shared/ui/link-card.ts` (`LinkCard`, `a[app-link-card]`, entrées
`overline`, `heading`, `align`), `src/app/features/blog/application/further-reading-copy.ts`
(`FURTHER_READING_COPY.heading`, `.relatedPostCtaLabel`), `blog-further-reading.ts`, branchement
dans `blog-detail.ts`. Signalement : `@angular-eslint/template/elements-content` signalera chaque
`<a app-link-card …></a>` des gabarits applicatifs (y compris le refactor précédent / suivant) ;
choix à faire au GREEN entre la directive de désactivation en ligne (précédent :
`admin-tags-selector.ts`) et l'option `allowList` de la règle dans `eslint.config.js`.

### Tranche 3 — un article renvoie vers la fiche de son projet

Contrat posé par les tests, non nommé au plan : `data-testid="project-link"` sur chaque
`a[app-link-card]` de projet, dans la `section` `further-reading` ; clé
`FURTHER_READING_COPY.projectLinkCtaLabel` (libellé de mesure, chaîne non vide, valeur laissée au
GREEN) ; `linkedProjects` accepte `undefined` (page sans article). Le sur-titre « Fiche du projet »
est asserté en littéral (texte validé, arbitrage 5) : sa clé de copie est libre. La sortie de
`BlogFurtherReading` n'est pas fixée : les tests passent par `BlogDetail` (clic → `trackCtaClick`) ;
une sortie `projectFollowed = output()` à côté de `postFollowed` suffit (même forme que la
tranche 2), `FurtherReadingTarget` n'a plus d'usage. Verrou éditorial : `FURTHER_READING_COPY` est
déjà enregistré, `editorialTexts` parcourt toutes ses valeurs, donc les nouvelles clés y passent sans
test ajouté.

`src/app/features/blog/domain/models/project-tag.model.spec.ts` (11 tests, sans TestBed) :

| Test | Scénario | Assertion clé |
|---|---|---|
| table | constante | `PROJECT_TAGS` `toEqual` les 3 entrées `DashFlow → dashflow`, `CandiDash → candidash`, `Portfolio → portfolio` |
| thème (`it.each` × 3, sur `PROJECT_TAGS`) | chaque tag de la table | `blogTagCategory(tag)` `toBe('projects')` |
| slug connu (`it.each` × 3) | `dashflow`, `candidash`, `portfolio` | `projectTagOf` `toBe` le tag |
| slug inconnu (`it.each` × 4) | `le-vieux-comptoir`, `DashFlow`, `Portfolio` (tag au lieu du slug), `''` | `toBeNull()` |

`src/app/features/blog/domain/linked-projects.spec.ts` (6 tests, `makeBlogPost`) :

| Test | Scénario | Assertion clé |
|---|---|---|
| sans article | `undefined` | `[]` |
| un projet | tags `Angular`, `DashFlow`, `Chiffrement` | `[{ tag: 'DashFlow', projectSlug: 'dashflow' }]` |
| ordre des tags | tags `Portfolio`, `SSR`, `DashFlow` (ordre inverse de la table) | `Portfolio` puis `DashFlow` |
| aucun (`it.each` × 3) | `Candidash` (casse différente) ; aucun tag de projet ; aucun tag | `[]` |

`src/app/features/blog/domain/models/blog-tag.model.spec.ts` : `Candidash` ajouté à la table des
tags libres (`toBeNull()`) ; égalité exacte, le tag libre ne tombe pas dans `projects`.

`src/app/features/blog/pages/blog-detail/blog-detail.spec.ts`, `describe('fiche du projet')` dans
« pour aller plus loin » (5 tests ; même `setup`, aucune valeur attendue existante modifiée) :

| Test | Scénario | Assertion clé |
|---|---|---|
| lien projet (`it.each` × 2) | article tagué `DashFlow` / `Portfolio`, aucun article proche | section rendue, `h2` « Pour aller plus loin », un `project-link` dans la section, `href` `/projects/dashflow` / `/projects/portfolio`, sur-titre « Fiche du projet », titre = tag, aucun `related-post` |
| casse différente | tags `Candidash`, `Angular`, un article proche | aucun `project-link`, `related-post` `/blog/proche` |
| ordre | tags `DashFlow`, `Angular`, un article proche | liens de la section : `project-link` `/projects/dashflow` puis `related-post` `/blog/proche` |
| clic mesuré | lien projet cliqué | `trackCtaClick('blog_project_link', FURTHER_READING_COPY.projectLinkCtaLabel)` × 1, libellé non vide, `navigateByUrl` vers `/projects/dashflow` |

Sweep de la catégorie `projects` dérivée (contrat changé : `CandiDash` et `Portfolio` entrent au
catalogue) : `grep` de `CandiDash`, `Candidash`, `Portfolio`, `PROJECT_TAGS`, `projectTagOf`,
`linkedProjects`, `blog_project_link`, `BLOG_TAGS_BY_CATEGORY`, `AVAILABLE_BLOG_TAGS` et
`blogTagCategory` sur `src/`, `e2e/` et `ci/`. Aucun test du blog n'encode ces tags comme libres ni
ne fige le contenu ou la taille de `projects` : `blog-tag-palette.spec.ts` lit
`BLOG_TAGS_BY_CATEGORY.projects[0]` (`DashFlow`, toujours premier) ; `related-posts.spec.ts`,
`count-posts-by-category.spec.ts`, `filter-posts-by-category.spec.ts` et `is-post-in-category.spec.ts`
n'emploient ni `CandiDash` ni `Portfolio`. Les autres occurrences sont des titres de projet
(`admin-projects`, `home-projects`, `projects`, `overview-view`) ou des données d'audience
(`analytics-builders.ts`, `admin-audience.spec.ts`), sans lien avec les tags du blog ;
`PROJECT_TAGS_MAX_COUNT` / `AVAILABLE_PROJECT_TAGS` (admin projet) sont homonymes, sans rapport. Les
tests des tranches 1 et 2 gardent leur contrat (l'article `courant` de la tranche 2 ne porte aucun
tag de projet). Aucune constante recalibrée, aucun état seedé dont la sémantique change.

Tous les tests de cette tranche échouent à ce stade (RED confirmé via la commande test du profil
le 2026-10-21 19:33, 11 failed / 4035 total). Nature des échecs : sur l'arbre réel, `pnpm test`
(après `ng cache clean` et purge de `node_modules/.vite`, code de sortie 1) s'arrête à la
compilation, uniquement sur des symboles applicatifs dus au GREEN : `TS2307` `./project-tag.model`
et `./linked-projects` ; `TS7031` / `TS2345` sur l'`it.each(PROJECT_TAGS.map(...))`, qui découlent
du module absent ; `TS2339` `FURTHER_READING_COPY.projectLinkCtaLabel` (× 2). Aucune faute de type
propre aux specs ; prettier et eslint verts sur les 4 fichiers touchés ; le motif d'archéologie du
profil ne trouve rien. Mesure du rouge comportemental : squelette jetable posé le temps d'une
exécution puis retiré (`PROJECT_TAGS` aux trois entrées, `projectTagOf` à `null`, `linkedProjects` à
`[]`, `projectLinkCtaLabel: ''`, catalogue, `BlogFurtherReading` et `BlogDetail` inchangés) :
11 failed / 4035 total, toutes en `AssertionError` (3 `projectTagOf`, 2 thème `CandiDash` /
`Portfolio`, 2 `linkedProjects`, 4 `BlogDetail`). Verts par nature sous le squelette (12) : la table,
le thème de `DashFlow`, les 4 slugs inconnus, les 4 cas « aucun » de `linkedProjects`, `Candidash`
libre, et le cas « casse différente » de la page. Harnais vérifié : une implémentation jetable
complète (`projectTagOf`, `linkedProjects`, catégorie `projects` dérivée de `PROJECT_TAGS`, volet
projet de `BlogFurtherReading` avec `projectFollowed`, branchement et mesure dans `BlogDetail`,
copie) donne 4035 passed / 4035, code de sortie 0 ; la même sans le branchement dans `BlogDetail`,
4 failed / 4035 (les 4 tests de page). Tout a été retiré (`git checkout` des fichiers applicatifs,
fichiers créés supprimés ; `git status` ne montre que les specs). Non-régression : 4035 = 4012 + 23
tests ajoutés (11 table et slug, 6 `linkedProjects`, 1 tag libre, 5 page) ; aucun test des tranches
antérieures ne tombe.

```
 Test Files  3 failed | 216 passed (219)
      Tests  11 failed | 4024 passed (4035)
```

Dû au GREEN : `src/app/features/blog/domain/models/project-tag.model.ts` (`ProjectTag`,
`PROJECT_TAGS`, `ProjectBlogTag`, `projectTagOf`), `src/app/features/blog/domain/linked-projects.ts`
(`linkedProjects(post: BlogPost | undefined)`), catégorie `projects` de `blog-tag.model.ts` dérivée
de `PROJECT_TAGS`, `FURTHER_READING_COPY.projectLinkCtaLabel` (plus la clé du sur-titre),
volet projet de `blog-further-reading.ts` (avant les articles), branchement de `BlogDetail` (section
rendue dès qu'il y a un projet **ou** un article proche, `trackCtaClick('blog_project_link', …)`).

## Journal des tranches

- **Tranche 1 — les tags manquants tombent dans leur thème** : GREEN 3959 passed / 3959 total · refactor : aucun (ajout de données au catalogue).
- **Tranche 2 — la page article propose jusqu'à trois articles proches dans le HTML rendu** : GREEN 4012 passed / 4012 total · refactor : cartes « article précédent / suivant » de `BlogDetail` passées sur `a[app-link-card]` (tests existants inchangés) ; `relatedPosts` sans type intermédiaire ni compteur mutable.
- **Tranche 3 — un article renvoie vers la fiche de son projet** : GREEN 4035 passed / 4035 total · refactor : aucun (volet projet ajouté à la liste existante de `BlogFurtherReading`, même forme de sortie que `postFollowed`).

## Verify

### Tranche 2 (2026-10-21)

Surface atteignable restructurée : la navigation « article précédent / suivant » de la page article
(passée sur `LinkCard`), plus la section « Pour aller plus loin ».

Steps :

1. `pnpm run build --configuration production` (code de sortie 0), puis `docker build` de l'image
   (même Dockerfile que la production).
2. Pile locale : image derrière la doublure `ci/api-stub`, fixtures copiées hors du dépôt avec un
   second article publié `article-voisin` (tag `TypeScript`, même thème Stack que `article-temoin`,
   tag `Angular`) ; fixtures du dépôt inchangées (leur évolution est prévue en tranche 4).
3. `curl` de `/blog/article-temoin` et `/blog/article-voisin` (HTML servi par le rendu à la
   requête), puis ouverture de `/blog/article-temoin` dans un navigateur.

Constats :

- HTML servi, `/blog/article-temoin` (200) : `section[data-testid="further-reading"]`
  `aria-labelledby="further-reading-title"`, `h2#further-reading-title` « Pour aller plus loin »,
  un `a[data-testid="related-post"]` `href="/blog/article-voisin"`, sur-titre « 3 sept. 2026 »,
  titre « Article voisin » ; la section suit `</article>` et précède
  `nav[aria-label="Autres articles"]`, dont `older-post` (`/blog/article-voisin`) porte les mêmes
  classes de carte qu'avant le refactor. `article-brouillon` (brouillon) n'est pas proposé.
- HTML servi, `/blog/article-voisin` : `newer-post` porte `sm:col-start-2 text-right` (identique à
  l'avant-refactor), article proche `/blog/article-temoin`.
- Navigateur : page hydratée (`ng-version` présent), rendu conforme (capture : carte « 3 sept. 2026 /
  Article voisin » sous « Pour aller plus loin », carte « article précédent » dessous). Aucune requête
  `/api/blog/**` émise par le navigateur au chargement : la liste vient de l'état de transfert.
- Console : aucune erreur due au diff. Bruit d'environnement préexistant : `GET /api/config` 404
  (route absente de la doublure) et avertissements giscus.

Verdict : **PASS** pour le rendu serveur et l'hydratation de la page article.

Non prouvé dans cette pile : la navigation interne au clic (vers un article proche comme vers
l'article précédent). Le navigateur lit l'API publique (`api.nedellec-julien.fr`), qui refuse
l'origine `127.0.0.1` (CORS) : la page retombe sur `/blog`, pour les deux types de carte, donc sans
lien avec le diff. Le clic mesuré (`trackCtaClick('blog_related_post', …)`) et la navigation sont
prouvés par `blog-detail.spec.ts`.

### Tranche 3 (2026-10-21)

Surface atteignable modifiée : la section « Pour aller plus loin » de la page article (volet projet
ajouté, condition d'affichage élargie à « projet ou article proche »).

Steps :

1. `pnpm run build --configuration production` (code de sortie 0), puis `docker build` de l'image.
2. Pile locale : image derrière la doublure `ci/api-stub` (`FIXTURES_DIR`), fixtures copiées hors du
   dépôt : `article-temoin` tagué `Angular`, `DashFlow` ; `article-voisin` (`TypeScript`) ;
   `article-sans-projet` (`Reconversion`, sans rapport). Fixtures du dépôt inchangées (tranche 4).
3. `curl` de `/blog/article-temoin` et `/blog/article-sans-projet`, puis ouverture de
   `/blog/article-temoin` dans un navigateur et clic sur la fiche du projet.

Constats :

- HTML servi, `/blog/article-temoin` (200) : dans `section[data-testid="further-reading"]`,
  `a[data-testid="project-link"]` `href="/projects/dashflow"` (sur-titre « Fiche du projet », titre
  « DashFlow ») **puis** `a[data-testid="related-post"]` `href="/blog/article-voisin"` ; la section
  suit `</article>` et précède `nav[aria-label="Autres articles"]`. Aucune lecture de `/api/projects`
  dans l'état de transfert (D3).
- HTML servi, `/blog/article-sans-projet` (200) : ni section ni lien projet.
- Navigateur : page hydratée (`ng-version`), capture : carte « Fiche du projet / DashFlow » puis
  « 3 sept. 2026 / Article voisin » sous « Pour aller plus loin », « article précédent » dessous ; le
  clic sur la fiche émet un `POST /api/analytics/track` et mène à `/projects/dashflow`.
- Console : une seule erreur, `GET /api/config` 404 (route absente de la doublure, préexistante).

Verdict : **PASS** pour le rendu serveur, l'hydratation et la navigation vers la fiche.

Non prouvé dans cette pile : le contenu de la fiche `/projects/dashflow` (absente des fixtures, la
page lit l'API publique, refusée en CORS) ; le corps exact du `cta_click` émis, prouvé par
`blog-detail.spec.ts`.
