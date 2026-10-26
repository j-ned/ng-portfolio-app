# Données du tournage extérieur et intérieur (spec 034, tranches 10 et 11)

Saisie du 2026-10-26, source unique de vérité : `src/app/features/workshop/domain/`
(`sources.static-data.ts`, `iso-groups.static-data.ts`, `materials.static-data.ts`,
`recommendations.static-data.ts`). Ce tableau les résume pour la revue ; en cas d'écart, le code fait
foi.

## Sources

| Id | Titre | Éditeur | URL |
|---|---|---|---|
| `sandvik-choose-insert` (S1) | Comment choisir une plaquette de tournage correcte | Sandvik Coromant | `/fr-fr/knowledge/general-turning/how-to-choose-correct-turning-insert` |
| `sandvik-external-turning` (S2) | Tournage extérieur | Sandvik Coromant | `/fr-fr/knowledge/general-turning/external-turning` |
| `sandvik-internal-turning` (S3) | Tournage intérieur | Sandvik Coromant | `/fr-fr/knowledge/general-turning/internal-turning` |
| `sandvik-turning-materials` (S4) | Tournage de différentes matières | Sandvik Coromant | `/fr-fr/knowledge/general-turning/how-to-do-turning-in-different-materials` |
| `sandvik-workpiece-materials` (S5) | Matériaux de pièce | Sandvik Coromant | `/fr-fr/knowledge/materials/workpiece-materials` |
| `mitsubishi-insert-identification` (MMC) | Turning Insert Identification | Mitsubishi Materials | `mitsubishicarbide.net/…/turning/tip_sensaku.html` |
| `kyocera-turning-inserts` (KYO) | Turning Indexable Inserts (catalogue, p. B1) | Kyocera | `asia.kyocera.com/…/B-Turning-Indexable.pdf` |
| `kyocera-aluminium-finishing` (KYO-AP) | AP Breaker | Kyocera | `tool-global.kyocera.com/en/prdct/tool/product/ap.php` |
| `julien-working-list` (LT) | Liste de travail de Julien — correspondances indicatives | Julien Nédellec | `https://nedellec-julien.fr/atelier` (aucune URL publique du document) |

Toutes consultées le 2026-10-26. Les pages Sandvik ont été relues en `fr-fr` le jour de la saisie
(titres, intitulés de section, noms des groupes).

## Groupes ISO 513 (S5, section « Groupes de matières usinées », écrit)

P Acier · M Acier inoxydable · K Fonte · N Métaux non ferreux · S Super-alliages et titane ·
H Matériau dur.

## Matières → groupe

Désignations : toutes écrites sur la liste de travail (LT, base écrite), affichées comme
correspondances indicatives. Groupe : S5, base écrite, sous-groupe entre parenthèses.

| Matière (slug) | Désignations | Groupe |
|---|---|---|
| `11smn30` | 11SMn30, 1.0715, 1215, S250 | P (non alliés) |
| `11smnpb30` | 11SMnPb30, 1.0718, 12L14, S250Pb | P (non alliés) |
| `s235jr` | S235JR, 1.0038, A36, E24 | P (non alliés) |
| `s355j2` | S355J2, 1.0577, A572 Gr.50, E36 | P (non alliés) |
| `c45` | C45, 1.0503, 1045, XC48, XC45 | P (non alliés) |
| `42crmo4` | 42CrMo4, 1.7225, 4140, 42CD4 | P (faiblement alliés) |
| `16mncr5` | 16MnCr5, 1.7131, 5115, 16MC5 | P (faiblement alliés) |
| `20nicrmo2-2` | 20NiCrMo2-2, 1.6523, 8620, 20NCD2 | P (faiblement alliés) |
| `100cr6` | 100Cr6, 1.3505, 52100, 100C6 | P (faiblement alliés) |
| `x8crnis18-9` | X8CrNiS18-9, 1.4305, 303, Z8CNF18-09 | M (austénitiques) |
| `x5crni18-10` | X5CrNi18-10, 1.4301, 304, Z7CN18-09 | M (austénitiques) |
| `x2crni18-9` | X2CrNi18-9, 1.4307, 304L, Z3CN18-10 | M (austénitiques) |
| `x2crnimo17-12-2` | X2CrNiMo17-12-2, 1.4404, 316L, Z3CND17-11-02 | M (austénitiques) |
| `x20cr13-x30cr13` | X20Cr13, X30Cr13, 1.4021, 1.4028, 420, Z20C13, Z30C13 | M (ferritiques et martensitiques) |
| `x5crnicunb16-4` | X5CrNiCuNb16-4, 1.4542, 17-4 PH, 630, Z6CNU17-04 | M |
| `x2crnimon22-5-3` | X2CrNiMoN22-5-3, 1.4462, 2205, Z3CND22-05Az | M (duplex) |
| `en-gjl-250` | EN-GJL-250, GG25, FGL 250, Ft 25 | K (grise) |
| `en-gjs-400-15` | EN-GJS-400-15, FGS 400, GGG40 | K (nodulaire) |
| `en-gjs-500-7` | EN-GJS-500-7, FGS 500, GGG50 | K (nodulaire) |
| `en-aw-2017a` | EN AW-2017A, AU4G | N (aluminium) |
| `en-aw-2024` | EN AW-2024, AU4G1 | N (aluminium) |
| `en-aw-2011-2030` | EN AW-2011, EN AW-2030, AU5PbBi | N (aluminium) |
| `titane-grade-2` | Titane Grade 2, R50400, 3.7035 | S (titane) |
| `ta6v` | TA6V, Ti-6Al-4V, Gr.5, R56400, 3.7165 | S (titane) |
| `inconel-718` | Inconel 718, N07718, 2.4668 | S (base nickel) |
| `inconel-625` | Inconel 625, N06625 | S (base nickel) |
| `hastelloy-c276` | Hastelloy C276, N10276 | S (base nickel) |
| `haynes-25` | Haynes 25, R30605 | S (base cobalt) |
| `stellite-6` | Stellite 6, R30006 | **H (stellites)** |
| `100cr6-trempe` | 100Cr6 trempé | H (aciers trempés) |
| `16mncr5-trempe` | 16MnCr5 trempé | H (aciers trempés) |
| `x153crmov12` | X153CrMoV12, 1.2379, D2, Z160CDV12 | H (aciers trempés) |

Exclues (passages coupés en bas de page de la liste) : la troisième ligne aluminium (EN AW-5083 /
5754, illisible) et tout ce qui la suit dans le groupe N, l'encadré « Règles d'or » du groupe P, le
tableau des vitesses (de toute façon jamais affiché, décision 13).

## Groupe × opération → code

Chaque champ du code est cité **pour son sens** sur la table de lecture (forme et tolérance : MMC ;
dépouille et fixation : KYO p. B1 ; base écrite). Le **choix** du code est porté par les citations
listées sous le code, à l'écran juste après lui. « déduit » = base `deduced`, mention « déduit des
principes du fabricant » affichée ; « écrit » = la source écrit le code. Une entrée couvre toutes les
matières de son groupe (décision 11).

| Groupe | Ébauche ext. | Semi-finition ext. | Finition ext. | Ébauche int. | Finition int. |
|---|---|---|---|---|---|
| P | CNMG | CNMG | CNMG | CCMT | DCMT |
| M | RCMT | RCMT | RCMT | CCMT | DCMT |
| K | CNMA | CNMA | CNMA | CCMT | DCMT |
| N | CCGT | CCGT | CCGT | CCGT | DCGT |
| S | RCGT | RCGT | RCGT | — | — |
| H | — | — | CNGA | — | — |

« — » : aucune recommandation, l'interface dit « Pas encore de recommandation pour ce cas. »

### D'où vient chaque lettre

| Code (cases) | Lettre ← principe (source, section, base) |
|---|---|
| CNMG (P ext.) | N et G ← S1 « Plaquette de tournage négative » (premier choix en extérieur, réversible) ; C ← S2 « Chariotage » (C 80° en premier choix avec épaulement) ; M ← S1 « Ebauche » / « Semi-finition » / « Finition » selon l'étape. Déduit. |
| CNMA (K ext.) | N ← S1 négative ; C ← S2 ; M ← S1 étape ; A ← S4 « Tournage des fontes » (copeau court, bon contrôle). Déduit. |
| CCMT (P, K int.) | C (dépouille) et T ← S1 « Plaquette de tournage positive » (premier choix en alésage, ne se retourne pas) ; C (forme) ← S3 « Chariotage » (C pour une arête plus résistante) ; M ← S1 « Ebauche ». Déduit. |
| DCMT (P, K int.) | idem, D ← S3 « Chariotage » (D 55° avec épaulement), M ← S1 « Finition ». Déduit. |
| CCMT / DCMT (M int.) | idem P, plus dépouille C ← S4 « Tournage des aciers inoxydables austénitiques » (dépouille positive). Déduit. |
| RCMT (M ext.) | R et C ← S4 « … austénitiques » (plaquette ronde ou faible angle d'attaque contre l'entaille, dépouille positive) ; M ← S1 étape ; T ← S1 positive. Déduit. |
| CCGT (N ext. ébauche et semi-finition) | C (dépouille) et G ← S4 « Tournage des alliages d'aluminium » (forme de base positive et arêtes vives, toujours) ; C (forme) ← S2 ; T ← S1 positive. Déduit. |
| CCGT (N finition ext.) | **Écrit** : KYO-AP (gamme CCGT, DCGT, TPGT, VCGT pour la finition de l'aluminium, extérieur et intérieur) ; C parmi les quatre ← S2 « Chariotage ». |
| CCGT (N ébauche int.) | S4 aluminium + S1 positive + S3 (C, arête plus résistante). Déduit. |
| DCGT (N finition int.) | **Écrit** : KYO-AP ; D parmi les quatre ← S3 « Chariotage » (D avec épaulement). |
| RCGT (S ext.) | R ← S4 « Tournage des superalliages réfractaires » (angle d'attaque inférieur à 45°) ; C et G ← S4 (arêtes vives indispensables) ; T ← S1 positive. Déduit. |
| CNGA (H finition ext.) | N ← S1 négative ; C ← S2 ; G et A ← S4 « Tournage des aciers trempés » (CBN, préparation d'arête). Déduit. |

### Géométrie, nuance, pièges

- Géométrie : (1) S1, section de l'étape + « Rayon de bec des plaquettes de tournage », écrit
  (géométrie de l'étape ; rayon égal à la profondeur de passe ou un peu moins, grand en ébauche, petit
  en finition ; aucun rayon chiffré) ; (2) à l'intérieur, S3 « Chariotage », écrit (petit angle de
  pointe, petit rayon, porte-à-faux court) ; (3) la section du groupe dans S4, écrit, « conseil du
  groupe ».
- Nuance : S4, section du groupe, écrit, « conseil du groupe ». En mots (CVD, PVD, CBN, PCD,
  céramique, carbure non revêtu), aucun nom commercial.
- Pièges : S4, section du groupe, « conseil du groupe » ; à l'intérieur, en plus, S3 (copeau mal
  évacué). Aucun piège pour K : S4 n'en écrit aucun.
- Vitesse de coupe : jamais renseignée (décision 13).

## Cases laissées vides, et pourquoi

| Cases | Raison |
|---|---|
| H : ébauche et semi-finition ext. | S4 : tournage dur aux profondeurs de passe les plus faibles possible ; S5 : groupe surtout usiné en finition. Aucune étape d'ébauche applicable. |
| H : ébauche et finition int. | Aucune page lue ne traite le tournage dur intérieur. |
| S : ébauche et finition int. | Principes contradictoires : S4 veut un angle d'attaque inférieur à 45° pour tout le groupe, S3 jamais moins de 75° à l'intérieur. Aucune forme ne satisfait les deux. |
