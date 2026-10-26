import type { OperationId } from './models/operation.model';
import type { IsoInsertDesignation, RecommendationEntry } from './models/recommendation.model';
import type { SourceCitation, SourceId, Sourced } from './models/source.model';

type TurningOperation = Extract<OperationId, `external-${string}` | `internal-${string}`>;
type Field = IsoInsertDesignation['fields'][number];
type Principle = readonly [SourceCitation, ...SourceCitation[]];

const cite = (
  source: SourceId,
  locator: string,
  basis: SourceCitation['basis'],
): SourceCitation => ({
  source,
  locator,
  basis,
});

const section = (name: string, detail?: string): string =>
  `section «\u00a0${name}\u00a0»${detail === undefined ? '' : ` (${detail})`}`;

const field = (name: string, code: string, meaning: string, where: SourceCitation): Field => ({
  value: { field: name, code, meaning },
  cite: where,
});

const SHAPE_TABLE = cite('mitsubishi-insert-identification', 'position 1, forme', 'stated');
const CLEARANCE_TABLE = cite('kyocera-turning-inserts', 'page B1, position 2, dépouille', 'stated');
const TOLERANCE_TABLE = cite(
  'mitsubishi-insert-identification',
  'position 3, classe de tolérance',
  'stated',
);
const FIXING_TABLE = cite(
  'kyocera-turning-inserts',
  'page B1, position 4, fixation et brise-copeaux',
  'stated',
);

const SHAPE = {
  C: field('Forme', 'C', 'Losange à 80°', SHAPE_TABLE),
  D: field('Forme', 'D', 'Losange à 55°', SHAPE_TABLE),
  R: field('Forme', 'R', 'Ronde', SHAPE_TABLE),
};
const CLEARANCE = {
  N: field('Dépouille', 'N', 'Dépouille de 0°', CLEARANCE_TABLE),
  C: field('Dépouille', 'C', 'Dépouille de 7°', CLEARANCE_TABLE),
};
const TOLERANCE = {
  M: field('Tolérance', 'M', 'Classe M, tolérance large', TOLERANCE_TABLE),
  G: field('Tolérance', 'G', 'Classe G, tolérance serrée', TOLERANCE_TABLE),
};
const FIXING = {
  G: field(
    'Fixation et brise-copeaux',
    'G',
    'Trou cylindrique, brise-copeaux sur les deux faces',
    FIXING_TABLE,
  ),
  T: field(
    'Fixation et brise-copeaux',
    'T',
    'Trou fraisé, brise-copeaux sur une face',
    FIXING_TABLE,
  ),
  A: field('Fixation et brise-copeaux', 'A', 'Trou cylindrique, sans brise-copeaux', FIXING_TABLE),
};

const iso = (
  choice: Principle,
  fields: readonly [Field, Field, Field, Field],
): IsoInsertDesignation => ({
  kind: 'iso-1832',
  choice,
  fields,
});

const deduced = (source: SourceId, locator: string): SourceCitation =>
  cite(source, locator, 'deduced');

const NEGATIVE = deduced(
  'sandvik-choose-insert',
  section('Plaquette de tournage négative', 'dépouille N, brise-copeaux sur les deux faces G'),
);
const NEGATIVE_CLEARANCE = deduced(
  'sandvik-choose-insert',
  section('Plaquette de tournage négative', 'dépouille N'),
);
const POSITIVE = deduced(
  'sandvik-choose-insert',
  section('Plaquette de tournage positive', 'dépouille C, brise-copeaux sur une face T'),
);
const ONE_SIDED = deduced(
  'sandvik-choose-insert',
  section('Plaquette de tournage positive', 'brise-copeaux sur une face T'),
);
const EXTERNAL_SHAPE = deduced(
  'sandvik-external-turning',
  section('Chariotage', 'type de plaquette, forme C'),
);
const INTERNAL_STRONG_SHAPE = deduced(
  'sandvik-internal-turning',
  section('Chariotage', 'type de plaquette, forme C pour une arête plus résistante'),
);
const INTERNAL_SHOULDER_SHAPE = deduced(
  'sandvik-internal-turning',
  section('Chariotage', 'type de plaquette, forme D avec épaulement'),
);
const ROUGHING_TOLERANCE = deduced('sandvik-choose-insert', section('Ebauche', 'classe M'));
const SEMI_FINISHING_TOLERANCE = deduced(
  'sandvik-choose-insert',
  section('Semi-finition', 'classe M'),
);
const FINISHING_TOLERANCE = deduced('sandvik-choose-insert', section('Finition', 'classe M'));
const CAST_IRON_FIXING = deduced(
  'sandvik-turning-materials',
  section('Tournage des fontes', 'copeau court, sans brise-copeaux A'),
);
const STAINLESS_SHAPE = deduced(
  'sandvik-turning-materials',
  section(
    'Tournage des aciers inoxydables austénitiques',
    'plaquette ronde R, dépouille positive C',
  ),
);
const STAINLESS_CLEARANCE = deduced(
  'sandvik-turning-materials',
  section('Tournage des aciers inoxydables austénitiques', 'dépouille positive C'),
);
const ALUMINIUM_EDGE = deduced(
  'sandvik-turning-materials',
  section("Tournage des alliages d'aluminium", 'forme de base positive C et arête vive G'),
);
const ALUMINIUM_FINISHING = cite(
  'kyocera-aluminium-finishing',
  "gamme CCGT, DCGT, TPGT et VCGT pour la finition de l'aluminium",
  'stated',
);
const SUPERALLOY_SHAPE = deduced(
  'sandvik-turning-materials',
  section('Tournage des superalliages réfractaires', "angle d'attaque inférieur à 45°, forme R"),
);
const SUPERALLOY_EDGE = deduced(
  'sandvik-turning-materials',
  section('Tournage des superalliages réfractaires', 'arêtes vives, dépouille C et classe G'),
);
const HARD_TURNING_EDGE = deduced(
  'sandvik-turning-materials',
  section(
    'Tournage des aciers trempés',
    "CBN et préparation d'arête, classe G sans brise-copeaux A",
  ),
);

const stated = (source: SourceId, locator: string, value: string): Sourced<string> => ({
  value,
  cite: cite(source, locator, 'stated'),
});

const RADIUS = 'Rayon de bec des plaquettes de tournage';

const STAGE_GEOMETRY = {
  roughing: stated(
    'sandvik-choose-insert',
    `${section('Ebauche')} et ${section(RADIUS)}`,
    "Géométrie d'ébauche, pour les fortes profondeurs de passe et avances et une arête très sûre\u202f; grand rayon de bec, égal à la profondeur de passe ou un peu moins.",
  ),
  semiFinishing: stated(
    'sandvik-choose-insert',
    `${section('Semi-finition')} et ${section(RADIUS)}`,
    "Géométrie de semi-finition, pour une ébauche moyenne à légère sur une large plage de profondeurs de passe et d'avances\u202f; rayon de bec égal à la profondeur de passe ou un peu moins.",
  ),
  finishing: stated(
    'sandvik-choose-insert',
    `${section('Finition')} et ${section(RADIUS)}`,
    'Géométrie de finition, pour les faibles profondeurs de passe et avances et des efforts de coupe faibles\u202f; petit rayon de bec, égal à la profondeur de passe ou un peu moins.',
  ),
};

const INTERNAL_GEOMETRY = stated(
  'sandvik-internal-turning',
  `${section('Chariotage')}, type de plaquette et porte-outil`,
  "À l'intérieur, un petit angle de pointe et un petit rayon de bec réduisent les efforts de coupe\u202f; garde le porte-à-faux le plus court possible.",
);

const INTERNAL_PITFALL = stated(
  'sandvik-internal-turning',
  'évacuation des copeaux',
  "Un copeau mal évacué peut casser la plaquette ou abîmer l'état de surface.",
);

const groupAdvice = (name: string, value: string): Sourced<string> => ({
  value,
  cite: {
    source: 'sandvik-turning-materials',
    locator: section(name),
    basis: 'stated',
    scope: 'group',
  },
});

type GroupAdvice = Pick<RecommendationEntry, 'materials' | 'grade' | 'pitfalls'> & {
  readonly geometry: Sourced<string>;
};

const STEEL: GroupAdvice = {
  materials: [
    '11smn30',
    '11smnpb30',
    's235jr',
    's355j2',
    'c45',
    '42crmo4',
    '16mncr5',
    '20nicrmo2-2',
    '100cr6',
  ],
  geometry: groupAdvice(
    'Tournage des aciers non alliés',
    "Sur l'acier non allié, arêtes vives et géométrie légère limitent le collage, et une plaquette wiper est conseillée.",
  ),
  grade: groupAdvice(
    'Tournage des aciers faiblement alliés',
    'Nuances et géométries pour aciers en premier choix\u202f; sur acier trempé, une nuance plus dure (céramique, CBN ou nuance pour fonte).',
  ),
  pitfalls: [
    groupAdvice(
      'Tournage des aciers non alliés',
      "Sous 0,25\u00a0% de carbone, le copeau se fragmente mal et l'arête rapportée guette\u00a0: vise une avance et une vitesse élevées.",
    ),
    groupAdvice(
      'Tournage des aciers faiblement alliés',
      "Sur l'acier allié, l'usure en cratère et en dépouille domine\u202f; sur l'acier trempé, la chaleur déforme l'arête.",
    ),
  ],
};

const STAINLESS: GroupAdvice = {
  materials: [
    'x8crnis18-9',
    'x5crni18-10',
    'x2crni18-9',
    'x2crnimo17-12-2',
    'x20cr13-x30cr13',
    'x5crnicunb16-4',
    'x2crnimon22-5-3',
  ],
  geometry: groupAdvice(
    'Tournage des aciers inoxydables austénitiques',
    "Arêtes vives ou géométrie à dépouille positive contre le collage et l'arête rapportée\u202f; rayon de bec aussi grand que possible.",
  ),
  grade: groupAdvice(
    'Tournage des aciers inoxydables austénitiques',
    'Nuances CVD ou PVD pour inox\u202f; PVD en coupe interrompue, ou quand le copeau martèle ou bourre.',
  ),
  pitfalls: [
    groupAdvice(
      'Tournage des aciers inoxydables austénitiques',
      "Contre l'usure en entaille, prends une plaquette ronde ou un faible angle d'attaque.",
    ),
    groupAdvice(
      'Tournage des aciers inoxydables austénitiques',
      "Arrose toujours, contre l'usure en cratère et la déformation plastique.",
    ),
  ],
};

const CAST_IRON: GroupAdvice = {
  materials: ['en-gjl-250', 'en-gjs-400-15', 'en-gjs-500-7'],
  geometry: groupAdvice(
    'Tournage des fontes',
    'Prends les géométries prévues pour la fonte\u00a0: le copeau est court et se contrôle bien.',
  ),
  grade: groupAdvice(
    'Tournage des fontes',
    'Nuances pour fontes\u202f; céramique ou CBN sur fonte grise à grande vitesse de coupe.',
  ),
  pitfalls: [],
};

const ALUMINIUM: GroupAdvice = {
  materials: ['en-aw-2017a', 'en-aw-2024', 'en-aw-2011-2030'],
  geometry: groupAdvice(
    "Tournage des alliages d'aluminium",
    'Toujours une plaquette à forme de base positive et à arêtes vives.',
  ),
  grade: groupAdvice(
    "Tournage des alliages d'aluminium",
    'Carbure non revêtu ou PCD en premier choix.',
  ),
  pitfalls: [
    groupAdvice(
      "Tournage des alliages d'aluminium",
      'Au-delà de 13\u00a0% de silicium, le carbure dure très peu\u00a0: passe au PCD.',
    ),
    groupAdvice(
      "Tournage des alliages d'aluminium",
      "L'arrosage sert surtout à évacuer les copeaux.",
    ),
  ],
};

const SUPERALLOY: GroupAdvice = {
  materials: [
    'titane-grade-2',
    'ta6v',
    'inconel-718',
    'inconel-625',
    'hastelloy-c276',
    'haynes-25',
  ],
  geometry: groupAdvice(
    'Tournage des superalliages réfractaires',
    'Arêtes vives indispensables, contre les couches blanches\u202f; diamètre de plaquette ou rayon de bec adapté à la profondeur de passe.',
  ),
  grade: groupAdvice(
    'Tournage des superalliages réfractaires',
    'Superalliages\u00a0: nuances PVD ou céramique. Titane\u00a0: surtout non revêtu ou PVD.',
  ),
  pitfalls: [
    groupAdvice(
      'Tournage des superalliages réfractaires',
      "L'usure en entaille est fréquente\u00a0: garde un angle d'attaque sous 45°.",
    ),
    groupAdvice(
      'Tournage des superalliages réfractaires',
      'En rampe ou en passes multiples, prends au moins 0,25\u00a0mm de profondeur de passe.',
    ),
    groupAdvice(
      'Tournage des superalliages réfractaires',
      'Arrosage obligatoire, abondant et bien dirigé.',
    ),
  ],
};

const HARD: GroupAdvice = {
  materials: ['stellite-6', '100cr6-trempe', '16mncr5-trempe', 'x153crmov12'],
  geometry: groupAdvice(
    'Tournage des aciers trempés',
    "Une préparation d'arête adaptée allonge la durée de vie, et une arête wiper améliore l'état de surface.",
  ),
  grade: groupAdvice(
    'Tournage des aciers trempés',
    'CBN, le meilleur matériau pour le tournage dur\u202f; sous 55\u00a0HRC environ, céramique ou carbure.',
  ),
  pitfalls: [
    groupAdvice('Tournage des aciers trempés', 'Il faut une machine stable et un bridage solide.'),
    groupAdvice(
      'Tournage des aciers trempés',
      'Garde des profondeurs de passe aussi faibles que possible.',
    ),
  ],
};

const STAGE_OF: Readonly<Record<TurningOperation, Sourced<string>>> = {
  'external-roughing': STAGE_GEOMETRY.roughing,
  'external-semi-finishing': STAGE_GEOMETRY.semiFinishing,
  'external-finishing': STAGE_GEOMETRY.finishing,
  'internal-roughing': STAGE_GEOMETRY.roughing,
  'internal-finishing': STAGE_GEOMETRY.finishing,
};

const recommend = (
  group: GroupAdvice,
  operation: TurningOperation,
  insert: IsoInsertDesignation,
): RecommendationEntry => {
  const internal = operation.startsWith('internal-');
  return {
    operation,
    materials: group.materials,
    insert,
    geometry: internal
      ? [STAGE_OF[operation], INTERNAL_GEOMETRY, group.geometry]
      : [STAGE_OF[operation], group.geometry],
    grade: group.grade,
    pitfalls: internal ? [...group.pitfalls, INTERNAL_PITFALL] : group.pitfalls,
  };
};

const CNMG = (stage: SourceCitation): IsoInsertDesignation =>
  iso([NEGATIVE, EXTERNAL_SHAPE, stage], [SHAPE.C, CLEARANCE.N, TOLERANCE.M, FIXING.G]);
const CNMA = (stage: SourceCitation): IsoInsertDesignation =>
  iso(
    [NEGATIVE_CLEARANCE, EXTERNAL_SHAPE, stage, CAST_IRON_FIXING],
    [SHAPE.C, CLEARANCE.N, TOLERANCE.M, FIXING.A],
  );
const CCMT_INTERNAL = iso(
  [POSITIVE, INTERNAL_STRONG_SHAPE, ROUGHING_TOLERANCE],
  [SHAPE.C, CLEARANCE.C, TOLERANCE.M, FIXING.T],
);
const DCMT_INTERNAL = iso(
  [POSITIVE, INTERNAL_SHOULDER_SHAPE, FINISHING_TOLERANCE],
  [SHAPE.D, CLEARANCE.C, TOLERANCE.M, FIXING.T],
);
const RCMT_STAINLESS = (stage: SourceCitation): IsoInsertDesignation =>
  iso([STAINLESS_SHAPE, stage, ONE_SIDED], [SHAPE.R, CLEARANCE.C, TOLERANCE.M, FIXING.T]);
const CCMT_STAINLESS_INTERNAL = iso(
  [POSITIVE, STAINLESS_CLEARANCE, INTERNAL_STRONG_SHAPE, ROUGHING_TOLERANCE],
  [SHAPE.C, CLEARANCE.C, TOLERANCE.M, FIXING.T],
);
const DCMT_STAINLESS_INTERNAL = iso(
  [POSITIVE, STAINLESS_CLEARANCE, INTERNAL_SHOULDER_SHAPE, FINISHING_TOLERANCE],
  [SHAPE.D, CLEARANCE.C, TOLERANCE.M, FIXING.T],
);
const CCGT_ALUMINIUM = iso(
  [ALUMINIUM_EDGE, EXTERNAL_SHAPE, ONE_SIDED],
  [SHAPE.C, CLEARANCE.C, TOLERANCE.G, FIXING.T],
);
const CCGT_ALUMINIUM_FINISHING = iso(
  [ALUMINIUM_FINISHING, EXTERNAL_SHAPE],
  [SHAPE.C, CLEARANCE.C, TOLERANCE.G, FIXING.T],
);
const CCGT_ALUMINIUM_INTERNAL = iso(
  [ALUMINIUM_EDGE, POSITIVE, INTERNAL_STRONG_SHAPE],
  [SHAPE.C, CLEARANCE.C, TOLERANCE.G, FIXING.T],
);
const DCGT_ALUMINIUM_INTERNAL = iso(
  [ALUMINIUM_FINISHING, INTERNAL_SHOULDER_SHAPE],
  [SHAPE.D, CLEARANCE.C, TOLERANCE.G, FIXING.T],
);
const RCGT_SUPERALLOY = iso(
  [SUPERALLOY_SHAPE, SUPERALLOY_EDGE, ONE_SIDED],
  [SHAPE.R, CLEARANCE.C, TOLERANCE.G, FIXING.T],
);
const CNGA_HARD = iso(
  [NEGATIVE_CLEARANCE, EXTERNAL_SHAPE, HARD_TURNING_EDGE],
  [SHAPE.C, CLEARANCE.N, TOLERANCE.G, FIXING.A],
);

export const RECOMMENDATIONS: readonly RecommendationEntry[] = [
  recommend(STEEL, 'external-roughing', CNMG(ROUGHING_TOLERANCE)),
  recommend(STEEL, 'external-semi-finishing', CNMG(SEMI_FINISHING_TOLERANCE)),
  recommend(STEEL, 'external-finishing', CNMG(FINISHING_TOLERANCE)),
  recommend(STEEL, 'internal-roughing', CCMT_INTERNAL),
  recommend(STEEL, 'internal-finishing', DCMT_INTERNAL),
  recommend(STAINLESS, 'external-roughing', RCMT_STAINLESS(ROUGHING_TOLERANCE)),
  recommend(STAINLESS, 'external-semi-finishing', RCMT_STAINLESS(SEMI_FINISHING_TOLERANCE)),
  recommend(STAINLESS, 'external-finishing', RCMT_STAINLESS(FINISHING_TOLERANCE)),
  recommend(STAINLESS, 'internal-roughing', CCMT_STAINLESS_INTERNAL),
  recommend(STAINLESS, 'internal-finishing', DCMT_STAINLESS_INTERNAL),
  recommend(CAST_IRON, 'external-roughing', CNMA(ROUGHING_TOLERANCE)),
  recommend(CAST_IRON, 'external-semi-finishing', CNMA(SEMI_FINISHING_TOLERANCE)),
  recommend(CAST_IRON, 'external-finishing', CNMA(FINISHING_TOLERANCE)),
  recommend(CAST_IRON, 'internal-roughing', CCMT_INTERNAL),
  recommend(CAST_IRON, 'internal-finishing', DCMT_INTERNAL),
  recommend(ALUMINIUM, 'external-roughing', CCGT_ALUMINIUM),
  recommend(ALUMINIUM, 'external-semi-finishing', CCGT_ALUMINIUM),
  recommend(ALUMINIUM, 'external-finishing', CCGT_ALUMINIUM_FINISHING),
  recommend(ALUMINIUM, 'internal-roughing', CCGT_ALUMINIUM_INTERNAL),
  recommend(ALUMINIUM, 'internal-finishing', DCGT_ALUMINIUM_INTERNAL),
  recommend(SUPERALLOY, 'external-roughing', RCGT_SUPERALLOY),
  recommend(SUPERALLOY, 'external-semi-finishing', RCGT_SUPERALLOY),
  recommend(SUPERALLOY, 'external-finishing', RCGT_SUPERALLOY),
  recommend(HARD, 'external-finishing', CNGA_HARD),
];
