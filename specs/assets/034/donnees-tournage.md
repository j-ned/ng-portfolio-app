# Données du tournage extérieur et intérieur (spec 034, tranches 10 et 11)

Saisie du 2026-10-26, codes par situation le même jour (décisions 14 à 16), source unique de vérité : `src/app/features/workshop/domain/`
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
| `julien-working-list` (LT) | Liste de travail de Julien — correspondances indicatives | Julien Nédellec | aucune (document sans adresse publique, titre affiché sans lien, décision 15) |

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
| `x20cr13-x30cr13` | X20Cr13, X30Cr13, 1.4021, 1.4028, 420, Z20C13, Z30C13 | **M (ferritiques et martensitiques)** |
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

## Classement : Sandvik l'emporte (décision 16)

Quand la liste de travail et Sandvik divergent, le classement de S5 (« Matériaux de pièce ») fait foi :
**Stellite 6 en H** (la liste la mettait en S) et **X20Cr13 / X30Cr13 en M** (S4 range les
martensitiques en P5). Un test d'intégrité garde ces deux classements.

## Situations

Libellés repris des pages Sandvik `fr-fr`, qui écrivent « Profilage » (pas « copiage ») et parlent
d'« angle de ramping plus grand » pour la forme V :

| Famille | Situation | Forme écrite | Page, section |
|---|---|---|---|
| Extérieur | Chariotage avec épaulement | C (80°) en priorité, épaulement à 91–95° | S2, « Chariotage » |
| Extérieur | Chariotage sans épaulement | S, carrée à 75° | S2, « Chariotage » |
| Extérieur | Profilage | D (55°) en premier choix, 93° | S2, « Profilage » |
| Extérieur | Profilage à forte rampe | V (35°) | S2, « Profilage » |
| Extérieur | Dressage | W, « trigone » à 95°, pour la polyvalence | S2, « Dressage » |
| Intérieur | Chariotage avec épaulement | T, triangulaire, 91–95° | S3, « Chariotage » |
| Intérieur | Avec épaulement, arête plus résistante | C (80°) | S3, « Chariotage » |
| Intérieur | Chariotage sans épaulement | S, carrée à 75° | S3, « Chariotage » |
| Intérieur | Profilage | D (55°) en premier choix | S3, « Profilage » |

Le dressage à 75° (S, « pour l'optimisation ») n'est pas une situation : il donne le même code que le
chariotage sans épaulement. La lettre W n'est pas écrite par S2, qui écrit « trigone » ; la table de
lecture (MMC) donne W = trigone.

## Groupe × opération → situations → code

Chaque proposition cite d'abord **la forme écrite pour sa situation** (page de la famille, base
écrite, sans mention), puis les principes d'où viennent la dépouille, la tolérance et la fixation (base
déduite, mention « déduit des principes du fabricant »), sauf quand une source écrit le code entier
(Kyocera, alu en finition : tout écrit, aucune mention). Chaque champ reste cité pour son **sens** sur la
table de lecture (forme et tolérance : MMC ; dépouille et fixation : KYO p. B1 ; écrit). Une entrée
couvre toutes les matières de son groupe (décision 11).

| Groupe | Opération | Situations → code |
|---|---|---|
| P | Ébauche ext. | chariotage avec épaulement **CNMG** · sans épaulement **SNMG** · dressage **WNMG** |
| P | Semi-finition ext. | chariotage avec épaulement **CNMG** · profilage **DNMG** · dressage **WNMG** |
| P | Finition ext. | chariotage avec épaulement **CNMG** · profilage **DNMG** · profilage à forte rampe **VNMG** |
| P, K | Ébauche int. | arête plus résistante **CCMT** · avec épaulement **TCMT** |
| P, K | Finition int. | avec épaulement **TCMT** · profilage **DCMT** |
| M | Ébauche, semi-finition, finition ext. | chariotage sans épaulement **SCMT** · profilage **RCMT** (ronde) |
| M | Ébauche, finition int. | chariotage sans épaulement **SCMT** |
| K | Ébauche ext. | chariotage avec épaulement **CNMA** · sans épaulement **SNMA** |
| K | Semi-finition, finition ext. | chariotage avec épaulement **CNMA** · profilage **DNMA** |
| N | Ébauche ext. | chariotage avec épaulement **CCGT** · sans épaulement **SCGT** · profilage **DCGT** |
| N | Semi-finition ext. | chariotage avec épaulement **CCGT** · profilage **DCGT** |
| N | Finition ext. | chariotage avec épaulement **CCGT** · profilage **DCGT** · profilage à forte rampe **VCGT** (écrits, KYO-AP) |
| N | Ébauche int. | arête plus résistante **CCGT** · avec épaulement **TCGT** · profilage **DCGT** |
| N | Finition int. | profilage **DCGT** · arête plus résistante **CCGT** (écrits, KYO-AP) |
| S | Ébauche, semi-finition, finition ext. | chariotage sans épaulement **RCGT** · profilage **RCGT** |
| H | Finition ext. | chariotage avec épaulement **CNGA** · dressage **WNGA** |

« — » ailleurs : H en ébauche, en semi-finition et à l'intérieur, S à l'intérieur (cf. plus bas).

### D'où vient chaque lettre

| Lettres | Principe (source, section, base) |
|---|---|
| Forme, P · K · N · H | Page de la famille pour la situation (S2 ou S3, tableau ci-dessus), **écrit**. |
| N, G (P) ; N (K, H) | S1 « Plaquette de tournage négative » (premier choix en extérieur), déduit. |
| M (tolérance) | S1 « Ebauche », « Semi-finition » ou « Finition » selon l'étape, déduit. |
| A (K) | S4 « Tournage des fontes » (copeau court), déduit. |
| C, T (P, K int.) | S1 « Plaquette de tournage positive » (premier choix en alésage), déduit. |
| C, G (N) | S4 « Tournage des alliages d'aluminium » (forme de base positive, arêtes vives, toujours), déduit ; T ← S1 positive, déduit. |
| Code entier (N finition) | KYO-AP, gamme CCGT, DCGT, TPGT et VCGT pour la finition de l'aluminium, **écrit**. |
| Forme S (M) | S2 ou S3 sans épaulement, écrit ; **plus** S4 inox « angle d'attaque faible contre l'usure en entaille, d'où 75° sans épaulement plutôt que 91–95° », écrit, conseil du groupe. |
| Forme R (M) | S4 inox « plaquette ronde contre l'usure en entaille, à la place de la forme D du profilage », écrit, conseil du groupe. |
| C (dépouille, M) | S4 inox « face de dépouille positive », déduit ; T ← S1 positive, déduit. |
| Forme R (S) | S4 superalliages « angle d'attaque inférieur à 45° » : la ronde, seule à le tenir, est **déduite** (la page n'écrit pas « ronde »), conseil du groupe. |
| C, G (S) | S4 superalliages (arêtes vives), déduit ; T ← S1 positive, déduit. |
| G, A (H) | S4 « Tournage des aciers trempés » (CBN, profondeur de coupe aussi petite que possible, arête wiper), déduit. |

Chaque proposition dont la matière impose une autre forme que la situation garde la citation de la
situation (S2 ou S3), puis la citation du groupe qui la remplace : l'écran dit pourquoi le code n'est
pas celui de la page de la situation.

## Situations omises (contrainte de matière)

| Groupe | Situations omises | Raison |
|---|---|---|
| M, extérieur | chariotage avec épaulement, profilage D, profilage à forte rampe, dressage | 91 à 95° (ou 93°) : angle d'attaque grand, contraire à « ronde ou angle d'attaque faible » (S4 inox, duplex aussi) ; la ronde ne fait pas d'épaulement. |
| M, intérieur | avec épaulement, arête plus résistante, profilage | Même raison ; la ronde est exclue aussi, car son angle d'attaque descend sous 75°, que S3 interdit à l'intérieur. Reste la carrée à 75°. |
| S, extérieur | chariotage avec épaulement, profilage D ou V, dressage | S4 : angle d'attaque inférieur à 45°. Seule la ronde le tient ; le chariotage sans épaulement (S à 75°) et le profilage passent à la ronde, en le disant. |

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
