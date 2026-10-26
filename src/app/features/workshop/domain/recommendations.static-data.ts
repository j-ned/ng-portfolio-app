import type { OperationId } from './models/operation.model';
import type {
  ExternalSituation,
  InsertSituation,
  InternalSituation,
  IsoInsertDesignation,
  IsoInsertProposal,
  RecommendationEntry,
} from './models/recommendation.model';
import type { SourceCitation, SourceId, Sourced } from './models/source.model';

type ExternalOperation = Extract<OperationId, `external-${string}`>;
type InternalOperation = Extract<OperationId, `internal-${string}`>;
type TurningOperation = ExternalOperation | InternalOperation;
type Field = IsoInsertProposal['fields'][number];

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
  S: field('Forme', 'S', 'Carrée', SHAPE_TABLE),
  T: field('Forme', 'T', 'Triangle', SHAPE_TABLE),
  V: field('Forme', 'V', 'Losange à 35°', SHAPE_TABLE),
  W: field('Forme', 'W', 'Trigone', SHAPE_TABLE),
};
type ShapeLetter = keyof typeof SHAPE;
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

const deduced = (source: SourceId, locator: string): SourceCitation =>
  cite(source, locator, 'deduced');

const writtenShape = (source: SourceId, name: string, detail: string): SourceCitation =>
  cite(source, section(name, detail), 'stated');

type Placed<S extends InsertSituation> = { readonly situation: S; readonly shape: SourceCitation };

const EXTERNAL = {
  shoulder: {
    situation: 'external-shoulder',
    shape: writtenShape(
      'sandvik-external-turning',
      'Chariotage',
      'forme C en priorité, épaulement à 91–95°',
    ),
  },
  noShoulder: {
    situation: 'external-no-shoulder',
    shape: writtenShape(
      'sandvik-external-turning',
      'Chariotage',
      "forme S, plaquette carrée à 75° d'angle d'attaque, sans épaulement",
    ),
  },
  profiling: {
    situation: 'external-profiling',
    shape: writtenShape(
      'sandvik-external-turning',
      'Profilage',
      "forme D en premier choix, angle d'attaque de 93°",
    ),
  },
  steepProfiling: {
    situation: 'external-steep-profiling',
    shape: writtenShape(
      'sandvik-external-turning',
      'Profilage',
      'forme V pour un angle de rampe plus grand',
    ),
  },
  facing: {
    situation: 'external-facing',
    shape: writtenShape(
      'sandvik-external-turning',
      'Dressage',
      "forme W, plaquette trigone à 95° d'angle d'attaque, pour la polyvalence",
    ),
  },
} as const satisfies Readonly<Record<string, Placed<ExternalSituation>>>;

const INTERNAL = {
  shoulder: {
    situation: 'internal-shoulder',
    shape: writtenShape(
      'sandvik-internal-turning',
      'Chariotage',
      'forme T, plaquette triangulaire, épaulement à 91–95°',
    ),
  },
  strongerEdge: {
    situation: 'internal-stronger-edge',
    shape: writtenShape(
      'sandvik-internal-turning',
      'Chariotage',
      'forme C pour une arête plus résistante',
    ),
  },
  noShoulder: {
    situation: 'internal-no-shoulder',
    shape: writtenShape(
      'sandvik-internal-turning',
      'Chariotage',
      "forme S, plaquette carrée à 75° d'angle d'attaque, sans épaulement",
    ),
  },
  profiling: {
    situation: 'internal-profiling',
    shape: writtenShape(
      'sandvik-internal-turning',
      'Profilage',
      "forme D en premier choix, angle d'attaque de 93°",
    ),
  },
} as const satisfies Readonly<Record<string, Placed<InternalSituation>>>;

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

const groupRule = (
  name: string,
  detail: string,
  basis: SourceCitation['basis'],
): SourceCitation => ({
  source: 'sandvik-turning-materials',
  locator: section(name, detail),
  basis,
  scope: 'group',
});

const STAINLESS_SECTION = 'Tournage des aciers inoxydables austénitiques';
const STAINLESS_ROUND = groupRule(
  STAINLESS_SECTION,
  "forme R, plaquette ronde contre l'usure en entaille, à la place de la forme D du profilage",
  'stated',
);
const STAINLESS_LOW_ANGLE = groupRule(
  STAINLESS_SECTION,
  "angle d'attaque faible contre l'usure en entaille, d'où 75° sans épaulement plutôt que 91–95°",
  'stated',
);
const STAINLESS_CLEARANCE = deduced(
  'sandvik-turning-materials',
  section(STAINLESS_SECTION, 'dépouille positive C'),
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
const SUPERALLOY_SECTION = 'Tournage des superalliages réfractaires';
const SUPERALLOY_ROUND = groupRule(
  SUPERALLOY_SECTION,
  "forme R, plaquette ronde, seule à garder l'angle d'attaque sous 45° à la place de la forme de la situation",
  'deduced',
);
const SUPERALLOY_EDGE = deduced(
  'sandvik-turning-materials',
  section(SUPERALLOY_SECTION, 'arêtes vives, dépouille C et classe G'),
);
const HARD_TURNING_EDGE = deduced(
  'sandvik-turning-materials',
  section(
    'Tournage des aciers trempés',
    'CBN, profondeur de coupe aussi petite que possible et arête wiper, classe G sans brise-copeaux A',
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

const external = (
  group: GroupAdvice,
  operation: ExternalOperation,
  insert: IsoInsertDesignation<ExternalSituation>,
): RecommendationEntry => ({
  operation,
  materials: group.materials,
  insert,
  geometry: [STAGE_OF[operation], group.geometry],
  grade: group.grade,
  pitfalls: group.pitfalls,
});

const internal = (
  group: GroupAdvice,
  operation: InternalOperation,
  insert: IsoInsertDesignation<InternalSituation>,
): RecommendationEntry => ({
  operation,
  materials: group.materials,
  insert,
  geometry: [STAGE_OF[operation], INTERNAL_GEOMETRY, group.geometry],
  grade: group.grade,
  pitfalls: [...group.pitfalls, INTERNAL_PITFALL],
});

const propose = <S extends InsertSituation>(
  { situation, shape }: Placed<S>,
  letter: ShapeLetter,
  rest: readonly [Field, Field, Field],
  ...principles: readonly SourceCitation[]
): IsoInsertProposal<S> => ({
  situation,
  choice: [shape, ...principles],
  fields: [SHAPE[letter], ...rest],
});

const iso = <S extends InsertSituation>(
  ...proposals: readonly [IsoInsertProposal<S>, ...IsoInsertProposal<S>[]]
): IsoInsertDesignation<S> => ({ kind: 'iso-1832', proposals });

const NMG = [CLEARANCE.N, TOLERANCE.M, FIXING.G] as const;
const NMA = [CLEARANCE.N, TOLERANCE.M, FIXING.A] as const;
const CMT = [CLEARANCE.C, TOLERANCE.M, FIXING.T] as const;
const CGT = [CLEARANCE.C, TOLERANCE.G, FIXING.T] as const;
const NGA = [CLEARANCE.N, TOLERANCE.G, FIXING.A] as const;

const steel = (stage: SourceCitation) =>
  ({
    shoulder: propose(EXTERNAL.shoulder, 'C', NMG, NEGATIVE, stage),
    noShoulder: propose(EXTERNAL.noShoulder, 'S', NMG, NEGATIVE, stage),
    profiling: propose(EXTERNAL.profiling, 'D', NMG, NEGATIVE, stage),
    steepProfiling: propose(EXTERNAL.steepProfiling, 'V', NMG, NEGATIVE, stage),
    facing: propose(EXTERNAL.facing, 'W', NMG, NEGATIVE, stage),
  }) as const;

const castIron = (stage: SourceCitation) =>
  ({
    shoulder: propose(EXTERNAL.shoulder, 'C', NMA, NEGATIVE_CLEARANCE, stage, CAST_IRON_FIXING),
    noShoulder: propose(EXTERNAL.noShoulder, 'S', NMA, NEGATIVE_CLEARANCE, stage, CAST_IRON_FIXING),
    profiling: propose(EXTERNAL.profiling, 'D', NMA, NEGATIVE_CLEARANCE, stage, CAST_IRON_FIXING),
  }) as const;

const positiveInside = (stage: SourceCitation) =>
  ({
    shoulder: propose(INTERNAL.shoulder, 'T', CMT, POSITIVE, stage),
    strongerEdge: propose(INTERNAL.strongerEdge, 'C', CMT, POSITIVE, stage),
    profiling: propose(INTERNAL.profiling, 'D', CMT, POSITIVE, stage),
  }) as const;

const stainlessOutside = (stage: SourceCitation): IsoInsertDesignation<ExternalSituation> =>
  iso<ExternalSituation>(
    propose(
      EXTERNAL.noShoulder,
      'S',
      CMT,
      STAINLESS_LOW_ANGLE,
      STAINLESS_CLEARANCE,
      stage,
      ONE_SIDED,
    ),
    propose(EXTERNAL.profiling, 'R', CMT, STAINLESS_ROUND, STAINLESS_CLEARANCE, stage, ONE_SIDED),
  );

const stainlessInside = (stage: SourceCitation): IsoInsertDesignation<InternalSituation> =>
  iso<InternalSituation>(
    propose(
      INTERNAL.noShoulder,
      'S',
      CMT,
      STAINLESS_LOW_ANGLE,
      STAINLESS_CLEARANCE,
      stage,
      ONE_SIDED,
    ),
  );

const aluminiumOutside = {
  shoulder: propose(EXTERNAL.shoulder, 'C', CGT, ALUMINIUM_EDGE, ONE_SIDED),
  noShoulder: propose(EXTERNAL.noShoulder, 'S', CGT, ALUMINIUM_EDGE, ONE_SIDED),
  profiling: propose(EXTERNAL.profiling, 'D', CGT, ALUMINIUM_EDGE, ONE_SIDED),
} as const;

const aluminiumFinishingOutside = iso<ExternalSituation>(
  propose(EXTERNAL.shoulder, 'C', CGT, ALUMINIUM_FINISHING),
  propose(EXTERNAL.profiling, 'D', CGT, ALUMINIUM_FINISHING),
  propose(EXTERNAL.steepProfiling, 'V', CGT, ALUMINIUM_FINISHING),
);

const superalloyOutside = iso<ExternalSituation>(
  propose(EXTERNAL.noShoulder, 'R', CGT, SUPERALLOY_ROUND, SUPERALLOY_EDGE, ONE_SIDED),
  propose(EXTERNAL.profiling, 'R', CGT, SUPERALLOY_ROUND, SUPERALLOY_EDGE, ONE_SIDED),
);

const hardFinishing = iso<ExternalSituation>(
  propose(EXTERNAL.shoulder, 'C', NGA, NEGATIVE_CLEARANCE, HARD_TURNING_EDGE),
  propose(EXTERNAL.facing, 'W', NGA, NEGATIVE_CLEARANCE, HARD_TURNING_EDGE),
);

const steelRoughing = steel(ROUGHING_TOLERANCE);
const steelSemiFinishing = steel(SEMI_FINISHING_TOLERANCE);
const steelFinishing = steel(FINISHING_TOLERANCE);
const castIronRoughing = castIron(ROUGHING_TOLERANCE);
const castIronSemiFinishing = castIron(SEMI_FINISHING_TOLERANCE);
const castIronFinishing = castIron(FINISHING_TOLERANCE);
const insideRoughing = positiveInside(ROUGHING_TOLERANCE);
const insideFinishing = positiveInside(FINISHING_TOLERANCE);

const STEEL_INSIDE_ROUGHING = iso<InternalSituation>(
  insideRoughing.strongerEdge,
  insideRoughing.shoulder,
);
const STEEL_INSIDE_FINISHING = iso<InternalSituation>(
  insideFinishing.shoulder,
  insideFinishing.profiling,
);

export const RECOMMENDATIONS: readonly RecommendationEntry[] = [
  external(
    STEEL,
    'external-roughing',
    iso<ExternalSituation>(steelRoughing.shoulder, steelRoughing.noShoulder, steelRoughing.facing),
  ),
  external(
    STEEL,
    'external-semi-finishing',
    iso<ExternalSituation>(
      steelSemiFinishing.shoulder,
      steelSemiFinishing.profiling,
      steelSemiFinishing.facing,
    ),
  ),
  external(
    STEEL,
    'external-finishing',
    iso<ExternalSituation>(
      steelFinishing.shoulder,
      steelFinishing.profiling,
      steelFinishing.steepProfiling,
    ),
  ),
  internal(STEEL, 'internal-roughing', STEEL_INSIDE_ROUGHING),
  internal(STEEL, 'internal-finishing', STEEL_INSIDE_FINISHING),
  external(STAINLESS, 'external-roughing', stainlessOutside(ROUGHING_TOLERANCE)),
  external(STAINLESS, 'external-semi-finishing', stainlessOutside(SEMI_FINISHING_TOLERANCE)),
  external(STAINLESS, 'external-finishing', stainlessOutside(FINISHING_TOLERANCE)),
  internal(STAINLESS, 'internal-roughing', stainlessInside(ROUGHING_TOLERANCE)),
  internal(STAINLESS, 'internal-finishing', stainlessInside(FINISHING_TOLERANCE)),
  external(
    CAST_IRON,
    'external-roughing',
    iso<ExternalSituation>(castIronRoughing.shoulder, castIronRoughing.noShoulder),
  ),
  external(
    CAST_IRON,
    'external-semi-finishing',
    iso<ExternalSituation>(castIronSemiFinishing.shoulder, castIronSemiFinishing.profiling),
  ),
  external(
    CAST_IRON,
    'external-finishing',
    iso<ExternalSituation>(castIronFinishing.shoulder, castIronFinishing.profiling),
  ),
  internal(CAST_IRON, 'internal-roughing', STEEL_INSIDE_ROUGHING),
  internal(CAST_IRON, 'internal-finishing', STEEL_INSIDE_FINISHING),
  external(
    ALUMINIUM,
    'external-roughing',
    iso<ExternalSituation>(
      aluminiumOutside.shoulder,
      aluminiumOutside.noShoulder,
      aluminiumOutside.profiling,
    ),
  ),
  external(
    ALUMINIUM,
    'external-semi-finishing',
    iso<ExternalSituation>(aluminiumOutside.shoulder, aluminiumOutside.profiling),
  ),
  external(ALUMINIUM, 'external-finishing', aluminiumFinishingOutside),
  internal(
    ALUMINIUM,
    'internal-roughing',
    iso<InternalSituation>(
      propose(INTERNAL.strongerEdge, 'C', CGT, ALUMINIUM_EDGE, ONE_SIDED),
      propose(INTERNAL.shoulder, 'T', CGT, ALUMINIUM_EDGE, ONE_SIDED),
      propose(INTERNAL.profiling, 'D', CGT, ALUMINIUM_EDGE, ONE_SIDED),
    ),
  ),
  internal(
    ALUMINIUM,
    'internal-finishing',
    iso<InternalSituation>(
      propose(INTERNAL.profiling, 'D', CGT, ALUMINIUM_FINISHING),
      propose(INTERNAL.strongerEdge, 'C', CGT, ALUMINIUM_FINISHING),
    ),
  ),
  external(SUPERALLOY, 'external-roughing', superalloyOutside),
  external(SUPERALLOY, 'external-semi-finishing', superalloyOutside),
  external(SUPERALLOY, 'external-finishing', superalloyOutside),
  external(HARD, 'external-finishing', hardFinishing),
];
