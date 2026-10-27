---
id: 038
title: Admin du guide des plaquettes regroupée par matière, en blocs repliables
type: feature
status: draft
created: 2026-10-27
related: [specs/035-guide-plaquettes-simplifie.md, specs/037-guide-alesage-toutes-matieres.md]
---

# 038 — Admin du guide par matière

## Description

### Objectif

Demande du propriétaire (2026-10-27), à partir d'une capture de `/admin/guide-plaquettes`. Chaque
outil y est une carte de cinq champs, et sa matière est ressaisie à chaque fois. Avec 50 outils sur
« 1.8522 (33CrMoV12) », il y aurait 50 cartes, ce qui est trop. Julien veut un écran rangé
proprement.

### Arbitrage (2026-10-27, décision de Julien)

**Par matière, en blocs repliables.** La matière se saisit une seule fois, en tête de son bloc.
Le bloc se replie et affiche son nombre d'outils. Une fois ouvert, il liste ses outils en **lignes
compactes**, une par outil, dans les colonnes Opération, Plaquette, Rayon, Remarque et Retirer.
« Toutes matières » a son propre bloc.

**Seule l'interface change.** Les données (`InsertGuide`, `PUT /api/workshop-guide`), l'API, le
guide public et le décodeur restent tels quels.

### Parcours

1. Julien ouvre l'admin. Il voit un bloc par matière, **replié**, avec le nom de la matière et le
   nombre d'outils (« 12 outils », « 1 outil »). Le bloc « Toutes matières » vient en dernier,
   s'il existe.
2. Il ouvre « 1.8522 (33CrMoV12) ». Le nom de la matière est un champ, qu'il peut corriger : la
   correction vaut pour tous les outils du bloc. En dessous, les outils s'affichent un par ligne.
3. « Ajouter un outil » ajoute une ligne vide à la fin du bloc et place le focus sur son
   opération.
4. « Ajouter une matière » crée un bloc ouvert, avec une ligne d'outil vide, et place le focus sur
   le nom de la matière.
5. « Ajouter le bloc Toutes matières » n'apparaît que si ce bloc n'existe pas encore. Le bloc
   créé est ouvert et contient une ligne vide.
6. Retirer le dernier outil d'un bloc retire aussi le bloc. « Retirer la matière » retire le bloc
   avec tous ses outils.
7. À l'enregistrement, si un champ est invalide dans un bloc replié, ce bloc s'ouvre et le focus
   va au premier champ invalide (`focusFirstInvalid`).

### Exigences

1. **Données inchangées** :
   - le brouillon se range par groupes, que l'on reconstruit à la lecture du document ;
   - les lignes avec matière sont regroupées par **texte exact** de la matière, une fois les
     espaces de bord retirés ;
   - les groupes gardent l'ordre de première apparition dans le document, avec le bloc
     « Toutes matières » à la fin ;
   - à l'envoi, les groupes sont remis à plat, champ par champ, dans l'ordre des blocs puis
     des lignes ;
   - le contrat de `toInsertGuidePayload` est inchangé : `allMaterials: true` sans `material`,
     pas de rayon quand il est vide, pas de remarque vide.
2. **Validation** : celle d'aujourd'hui, à deux changements près.
   - La matière est exigée une fois par bloc, sauf pour le bloc « Toutes matières ».
   - Deux blocs ne peuvent pas avoir le même nom de matière une fois les espaces de bord retirés.
     Le message, sur le second, propose de fusionner les outils dans le premier.
   - Les autres règles ne changent pas : opération exigée, limites de longueur, bornes du rayon,
     garde de confidentialité (spec 035, appliquée au nom de matière et à chaque outil) et
     plafond de 300 lignes au total.
3. **Suggestions (#285)** : le nom de matière d'un bloc garde ses suggestions, à partir des
   matières déjà enregistrées. La plaquette garde les siennes.
4. **Repli** :
   - chaque bloc est un `<details>` natif dont le `<summary>` porte le nom et le compte ;
   - l'état ouvert est piloté par un signal, pour les ouvertures automatiques (ajout, erreur à
     l'envoi) ;
   - un bloc qui vient d'être créé s'ouvre ;
   - après un enregistrement réussi, les blocs gardent leur état.
5. **Accessibilité** :
   - les lignes compactes n'ont pas de libellé visible par cellule : chaque champ reçoit un nom
     accessible complet, par `aria-label` ou par `aria-labelledby` vers l'en-tête de colonne et
     le numéro d'outil, par exemple « Plaquette, outil 2 de 1.8522 (33CrMoV12) » ;
   - les messages d'erreur restent sous le champ, avec `role="alert"`, et sont reliés par
     `aria-describedby` ;
   - « Retirer » a un nom qui dit quel outil il retire ;
   - cibles de 44 px minimum ;
   - zéro violation axe ;
   - le compte du `<summary>` est du texte.
6. **Responsive** :
   - à 1024 px et plus, chaque ligne d'outil tient sur une rangée ;
   - en dessous, la ligne passe sur deux rangées : Opération et Plaquette d'abord, puis Rayon,
     Remarque et Retirer ;
   - aucun libellé n'est rogné (remarque de la revue de la spec 037 : « Toutes matières » coupé
     à 1024 px) ;
   - pas de défilement horizontal de la page.
7. **Découpage** : le template de la ligne admin dépasse 150 lignes (revue de la spec 037). Le
   bloc de matière et la ligne d'outil sont deux composants dumb distincts, chacun sous ce seuil.

### Hors périmètre

- Le tri des blocs ou des outils par glisser-déposer.
- La fusion automatique de deux graphies voisines (« inox 316l » et « Inox 316L »).
- Tout changement côté API, guide public ou décodeur.

## Plan technique

- `admin/application/insert-guide-draft.ts` :
  - nouveau brouillon `InsertGuideDraft = { enabled; decoderEnabled; groups: InsertGuideGroupDraft[] }`,
    avec `InsertGuideGroupDraft = { key; material; allMaterials; tools: InsertGuideToolDraft[] }`
    et `InsertGuideToolDraft = { key; operation; insert; noseRadius; note }` ;
  - `toInsertGuideDraft(guide, previous?)` regroupe les lignes et garde les clés des groupes et
    des outils d'après leur position dans `previous`, comme aujourd'hui ;
  - `toInsertGuidePayload` remet à plat ;
  - `newInsertGuideGroup(allMaterials)` et `newInsertGuideTool()`.
- `admin-insert-guide-form.ts` :
  - schéma `applyEach(path.groups, (group) => { … applyEach(group.tools, …) })` ;
  - validation croisée des noms de matière en double ;
  - plafond de 300 sur la somme des outils ;
  - ajout et retrait par `model.update()` ;
  - focus par `afterNextRender` ;
  - état ouvert par groupe dans un `signal<ReadonlySet<string>>` des clés ouvertes ;
  - après un `submit()` invalide, les groupes en erreur s'ouvrent, puis `focusFirstInvalid`
    s'applique après le rendu.
- Nouveaux composants, qui remplacent `admin-insert-guide-row.ts` :
  - `admin-insert-guide-group.ts` : `<details>` et `<summary>`, champ de nom de matière avec
    suggestions (`app-suggest-input`), outils et boutons d'ajout et de retrait ;
  - `admin-insert-guide-tool.ts` : la ligne compacte, en grille Tailwind.
- La copie admin, nouvelle ou dans le fichier existant si le composant en a un :
  - libellés des blocs ;
  - comptes : « 1 outil » / « N outils », via `@shared/format/counted` qui existe déjà ;
  - noms accessibles.
- Tests (RED d'abord, `data-testid`, builders) :
  - brouillon : regroupement, ordre, bloc générique en dernier, remise à plat, clés gardées ;
  - formulaire et page :
    - blocs repliés et leur compte ;
    - ajout d'outil, de matière et du bloc générique, avec le focus ;
    - retrait d'outil et de bloc ;
    - nom en double refusé ;
    - erreur dans un bloc replié : le bloc s'ouvre et le focus arrive sur le champ ;
    - payload du `PUT` complet ;
    - noms accessibles des champs ;
  - mise à jour de `e2e/a11y/interactive-states.spec.ts` si l'admin du guide y figure ;
  - `DESIGN.md` : quelques lignes sur le motif « bloc repliable et lignes compactes » s'il est
    nouveau.
