import { describe, expect, it } from 'vitest';
import { editorialTexts } from '../../../testing/editorial-sources';
import {
  aCitation,
  anIsoInsert,
  aRecommendation,
  aSource,
  aSourced,
} from '../testing/insert-guide-builders';
import { ISO_513_GROUPS } from './iso-groups.static-data';
import { MATERIALS } from './materials.static-data';
import type { IsoGroupLetter, Material } from './models/material.model';
import type { CuttingSpeedRange, RecommendationEntry } from './models/recommendation.model';
import type { Source, SourceCitation, SourceId, Sourced } from './models/source.model';
import { normalizeDesignation } from './normalize-designation';
import { OPERATION_FAMILIES } from './operations.static-data';
import { RECOMMENDATIONS } from './recommendations.static-data';
import { SOURCES } from './sources.static-data';

const SLUG_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const duplicates = (values: readonly string[]): readonly string[] => [
  ...new Set(values.filter((value, index) => values.indexOf(value) !== index)),
];

const sourcedTexts = (material: Material): readonly string[] => [
  ...material.designations.flatMap((designation) => [designation.value, designation.cite.locator]),
  material.isoGroup.cite.locator,
  ...material.behaviour.flatMap((line) => [line.value, line.cite.locator]),
];

const GENERATIVE_AI =
  /gemini|chatgpt|openai|claude|anthropic|copilot|mistral|perplexity|llama|intelligence artificielle|\bIA\b|\bAI\b|référentiel des alliages/iu;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type SourceDefect = 'ai' | 'blank-text' | 'invalid-url' | 'invalid-date';

const isCalendarDate = (text: string): boolean =>
  ISO_DATE.test(text) && new Date(`${text}T00:00:00Z`).toISOString().startsWith(text);

const isHttpsUrl = (text: string): boolean =>
  URL.canParse(text) && new URL(text).protocol === 'https:' && new URL(text).hostname !== '';

const sourceDefects = (source: Source): readonly SourceDefect[] => {
  const defects: SourceDefect[] = [];
  if ([source.title, source.publisher, source.url].some((text) => GENERATIVE_AI.test(text))) {
    defects.push('ai');
  }
  if ([source.title, source.publisher].some((text) => text.trim() === '')) {
    defects.push('blank-text');
  }
  if (!isHttpsUrl(source.url)) {
    defects.push('invalid-url');
  }
  if (!isCalendarDate(source.consultedOn)) {
    defects.push('invalid-date');
  }
  return defects;
};

describe('SOURCES', () => {
  it('Given the catalogue When each source is checked Then none has a defect', () => {
    const defective = Object.entries<Source>(SOURCES)
      .filter(([, source]) => sourceDefects(source).length > 0)
      .map(([id]) => id);

    expect(defective).toEqual([]);
  });

  it('Given a well-formed fictional source When it is checked Then it has no defect', () => {
    expect(sourceDefects(aSource())).toEqual([]);
  });

  it.each<[string, Partial<Source>]>([
    ['a title naming Gemini', { title: 'Référentiel fictif généré par Gemini' }],
    ['a title naming ChatGPT', { title: 'Export ChatGPT fictif' }],
    ['a title naming Claude', { title: 'Synthèse fictive par Claude' }],
    ['a title naming Copilot', { title: 'Brouillon Copilot fictif' }],
    ['a title naming the AI material list', { title: 'Référentiel des alliages' }],
    ['a publisher naming artificial intelligence', { publisher: 'Intelligence artificielle' }],
    ['a publisher abbreviated IA', { publisher: 'Assistant IA fictif' }],
    ['a publisher naming OpenAI', { publisher: 'OpenAI' }],
    ['a URL on an AI service', { url: 'https://gemini.google.com/share/fictif' }],
  ])(
    'Given a fictional source with %s When it is checked Then it is flagged as AI',
    (_, overrides) => {
      expect(sourceDefects(aSource(overrides))).toEqual(['ai']);
    },
  );

  it.each<[string, Partial<Source>, SourceDefect]>([
    ['a blank title', { title: '  ' }, 'blank-text'],
    ['a blank publisher', { publisher: '\u00a0' }, 'blank-text'],
    ['a URL without host', { url: 'https://' }, 'invalid-url'],
    ['a URL that does not parse', { url: 'https://exemple invalide' }, 'invalid-url'],
    ['a date in another format', { consultedOn: '01/01/2001' }, 'invalid-date'],
    ['a date that does not exist', { consultedOn: '2001-02-30' }, 'invalid-date'],
  ])(
    'Given a fictional source with %s When it is checked Then it is flagged',
    (_, overrides, defect) => {
      expect(sourceDefects(aSource(overrides))).toEqual([defect]);
    },
  );
});

describe('MATERIALS', () => {
  it('Given the reference When slugs are read Then each one is unique and URL-safe', () => {
    const slugs = MATERIALS.map((material) => material.slug);

    expect(duplicates(slugs)).toEqual([]);
    expect(slugs.filter((slug) => !SLUG_FORMAT.test(slug))).toEqual([]);
  });

  it('Given the reference When designations are normalized Then no two materials share one', () => {
    const owners = MATERIALS.flatMap((material) => [
      ...new Set(material.designations.map(({ value }) => normalizeDesignation(value))),
    ]);

    expect(duplicates(owners)).toEqual([]);
  });

  it('Given the reference When its texts are read Then none is blank', () => {
    const blanks = MATERIALS.flatMap((material) =>
      sourcedTexts(material)
        .filter((text) => text.trim() === '')
        .map(() => material.slug),
    );

    expect(blanks).toEqual([]);
  });
});

type RecommendationDefect =
  'unknown-material' | 'duplicate-coverage' | 'invalid-speed' | 'blank-text';

const hasValidSpeed = ({ cuttingSpeed }: RecommendationEntry): boolean =>
  cuttingSpeed === undefined ||
  (Number.isFinite(cuttingSpeed.value.max) &&
    cuttingSpeed.value.min > 0 &&
    cuttingSpeed.value.min <= cuttingSpeed.value.max);

const recommendationDefects = (
  entries: readonly RecommendationEntry[],
  materialSlugs: readonly string[],
): readonly RecommendationDefect[] => {
  const covered = entries.flatMap((entry) =>
    entry.materials.map((material) => `${material} × ${entry.operation}`),
  );
  const checks: readonly (readonly [RecommendationDefect, boolean])[] = [
    [
      'unknown-material',
      entries.some((entry) => entry.materials.some((slug) => !materialSlugs.includes(slug))),
    ],
    ['duplicate-coverage', duplicates(covered).length > 0],
    ['invalid-speed', !entries.every(hasValidSpeed)],
    ['blank-text', editorialTexts(entries, 'entries').some(({ text }) => text.trim() === '')],
  ];
  return checks.filter(([, failed]) => failed).map(([defect]) => defect);
};

describe('RECOMMENDATIONS', () => {
  it('Given the reference When each entry is checked Then none has a defect', () => {
    expect(
      recommendationDefects(
        RECOMMENDATIONS,
        MATERIALS.map(({ slug }) => slug),
      ),
    ).toEqual([]);
  });

  describe('Given fictional entries for the materials "alliage-essai-alpha" and "alliage-essai-beta"', () => {
    const KNOWN = ['alliage-essai-alpha', 'alliage-essai-beta'];
    const speed = (min: number, max: number): Sourced<CuttingSpeedRange> =>
      aSourced({ min, max, unit: 'm/min' });

    it.each<[string, readonly RecommendationEntry[]]>([
      ['no entry', []],
      [
        'an entry without cutting speed',
        [aRecommendation('grooving', { materials: ['alliage-essai-alpha'] })],
      ],
      [
        'a speed range of a single value',
        [
          aRecommendation('external-finishing', {
            materials: ['alliage-essai-alpha'],
            cuttingSpeed: speed(1, 1),
          }),
        ],
      ],
      [
        'one material in two operations and two materials in one operation',
        [
          aRecommendation('grooving', { materials: ['alliage-essai-alpha'] }),
          aRecommendation('threading', {
            materials: ['alliage-essai-alpha', 'alliage-essai-beta'],
          }),
        ],
      ],
    ])('When %s is checked Then it has no defect', (_, entries) => {
      expect(recommendationDefects(entries, KNOWN)).toEqual([]);
    });

    it.each<[string, readonly RecommendationEntry[], RecommendationDefect]>([
      [
        'an entry naming an unknown material',
        [aRecommendation('grooving', { materials: ['alliage-essai-alpha', 'alliage-inconnu'] })],
        'unknown-material',
      ],
      [
        'two entries covering the same couple',
        [
          aRecommendation('grooving', { materials: ['alliage-essai-alpha'] }),
          aRecommendation('grooving', { materials: ['alliage-essai-beta', 'alliage-essai-alpha'] }),
        ],
        'duplicate-coverage',
      ],
      [
        'an entry naming a material twice',
        [aRecommendation('threading', { materials: ['alliage-essai-beta', 'alliage-essai-beta'] })],
        'duplicate-coverage',
      ],
      [
        'a speed starting at zero',
        [
          aRecommendation('external-roughing', {
            materials: ['alliage-essai-alpha'],
            cuttingSpeed: speed(0, 10),
          }),
        ],
        'invalid-speed',
      ],
      [
        'a negative speed',
        [
          aRecommendation('external-roughing', {
            materials: ['alliage-essai-alpha'],
            cuttingSpeed: speed(-10, 10),
          }),
        ],
        'invalid-speed',
      ],
      [
        'a speed range upside down',
        [
          aRecommendation('internal-finishing', {
            materials: ['alliage-essai-alpha'],
            cuttingSpeed: speed(20, 10),
          }),
        ],
        'invalid-speed',
      ],
      [
        'a speed that is not a number',
        [
          aRecommendation('internal-finishing', {
            materials: ['alliage-essai-alpha'],
            cuttingSpeed: speed(Number.NaN, 10),
          }),
        ],
        'invalid-speed',
      ],
      [
        'an endless speed range',
        [
          aRecommendation('internal-finishing', {
            materials: ['alliage-essai-alpha'],
            cuttingSpeed: speed(10, Number.POSITIVE_INFINITY),
          }),
        ],
        'invalid-speed',
      ],
      [
        'a blank geometry',
        [
          aRecommendation('grooving', {
            materials: ['alliage-essai-alpha'],
            geometry: [aSourced('  ')],
          }),
        ],
        'blank-text',
      ],
      [
        'a blank grade',
        [
          aRecommendation('grooving', {
            materials: ['alliage-essai-alpha'],
            grade: aSourced('\u00a0'),
          }),
        ],
        'blank-text',
      ],
      [
        'a blank pitfall',
        [
          aRecommendation('grooving', {
            materials: ['alliage-essai-alpha'],
            pitfalls: [aSourced('Piège fictif.'), aSourced('')],
          }),
        ],
        'blank-text',
      ],
      [
        'a blank meaning in the ISO designation',
        [
          aRecommendation('external-finishing', {
            materials: ['alliage-essai-alpha'],
            insert: {
              ...anIsoInsert(),
              fields: [aSourced({ field: 'Champ fictif', code: 'Z', meaning: ' ' })],
            },
          }),
        ],
        'blank-text',
      ],
      [
        'a blank described aspect',
        [
          aRecommendation('parting-off', {
            materials: ['alliage-essai-alpha'],
            insert: { kind: 'described', aspects: [aSourced({ aspect: 'profile', text: '' })] },
          }),
        ],
        'blank-text',
      ],
      [
        'a blank locator',
        [
          aRecommendation('grooving', {
            materials: ['alliage-essai-alpha'],
            geometry: [{ value: 'Géométrie fictive.', cite: aCitation({ locator: ' ' }) }],
          }),
        ],
        'blank-text',
      ],
    ])('When %s is checked Then it is flagged', (_, entries, defect) => {
      expect(recommendationDefects(entries, KNOWN)).toEqual([defect]);
    });
  });
});

const COMMERCIAL_NAMES: readonly RegExp[] = [/sandvik/iu, /\bCoro\p{Lu}/u];

const CITED_SOURCE_ID = /(?:\.cite|\.choice\[\d+\])\.source$/u;

const commercialNamesIn = (value: unknown, name: string): readonly string[] =>
  editorialTexts(value, name)
    .filter(
      ({ path, text }) =>
        !CITED_SOURCE_ID.test(path) && COMMERCIAL_NAMES.some((pattern) => pattern.test(text)),
    )
    .map(({ path }) => path);

describe('commercial names', () => {
  it.each<[string, unknown]>([
    ['MATERIALS', MATERIALS],
    ['OPERATION_FAMILIES', OPERATION_FAMILIES],
    ['RECOMMENDATIONS', RECOMMENDATIONS],
  ])('Given %s When its texts are read Then none names a product or its maker', (name, value) => {
    expect(commercialNamesIn(value, name)).toEqual([]);
  });

  it.each<[string, unknown, readonly string[]]>([
    [
      'a maker name in a value',
      { geometry: { value: 'Arête fictive façon Sandvik' } },
      ['sample.geometry.value'],
    ],
    [
      'a maker name in capitals',
      { grade: { value: 'Nuance SANDVIK fictive' } },
      ['sample.grade.value'],
    ],
    [
      'a product name',
      { pitfalls: [{ value: 'Plaquette CoroFictive' }] },
      ['sample.pitfalls[0].value'],
    ],
    [
      'a maker name in a locator',
      { geometry: { cite: { source: 'source-fictive', locator: 'Sandvik, page 1' } } },
      ['sample.geometry.cite.locator'],
    ],
  ])('Given %s When the guard reads it Then it is flagged', (_, value, paths) => {
    expect(commercialNamesIn(value, 'sample')).toEqual(paths);
  });

  it.each<[string, unknown]>([
    ['a word starting like a product', { value: 'Corrosion et Coromandel fictifs' }],
    [
      'the id of a catalogued source',
      { geometry: { cite: { source: 'sandvik-fictif', locator: 'fixture' } } },
    ],
  ])('Given %s When the guard reads it Then it is not flagged', (_, value) => {
    expect(commercialNamesIn(value, 'sample')).toEqual([]);
  });
});

const ISO_GROUP_LETTERS: readonly IsoGroupLetter[] = ['P', 'M', 'K', 'N', 'S', 'H'];

const SANDVIK_HOST = 'www.sandvik.coromant.com';

const WORKING_LIST: SourceId = 'julien-working-list';

const isSandvikPage = (id: SourceId): boolean => new URL(SOURCES[id].url).hostname === SANDVIK_HOST;

const isCitation = (value: object): value is SourceCitation =>
  'source' in value && 'locator' in value && 'basis' in value;

const citationsIn = (value: unknown): readonly SourceCitation[] => {
  if (Array.isArray(value)) {
    return value.flatMap(citationsIn);
  }
  if (value !== null && typeof value === 'object') {
    return isCitation(value) ? [value] : Object.values(value).flatMap(citationsIn);
  }
  return [];
};

const materialsOf = (letter: IsoGroupLetter): readonly string[] =>
  MATERIALS.filter(({ isoGroup }) => isoGroup.value === letter).map(({ slug }) => slug);

const groupOf = (slug: string): IsoGroupLetter | undefined =>
  MATERIALS.find((material) => material.slug === slug)?.isoGroup.value;

describe('ISO_513_GROUPS', () => {
  it('Given the six groups When they are read Then each one sits under its own letter', () => {
    expect(Object.entries(ISO_513_GROUPS).map(([key, group]) => [key, group.letter])).toEqual(
      ISO_GROUP_LETTERS.map((letter) => [letter, letter]),
    );
  });

  it('Given the six groups When their names are read Then each is written by a Sandvik Coromant page', () => {
    expect(
      Object.values(ISO_513_GROUPS)
        .filter(
          ({ name }) =>
            name.value.trim() === '' ||
            name.cite.basis !== 'stated' ||
            !isSandvikPage(name.cite.source),
        )
        .map(({ letter }) => letter),
    ).toEqual([]);
  });

  it('Given the materials When their groups are read Then each group cited by a material has its entry', () => {
    expect(
      MATERIALS.filter(({ isoGroup }) => !Object.hasOwn(ISO_513_GROUPS, isoGroup.value)).map(
        ({ slug }) => slug,
      ),
    ).toEqual([]);
  });

  it('Given a material sheet When its group is cited Then the citation is the page that names the group', () => {
    expect(
      MATERIALS.filter(
        ({ isoGroup }) => isoGroup.cite.source !== ISO_513_GROUPS[isoGroup.value].name.cite.source,
      ).map(({ slug }) => slug),
    ).toEqual([]);
  });
});

describe('MATERIALS content', () => {
  it('Given the reference When materials are grouped Then every ISO group has at least one', () => {
    expect(ISO_GROUP_LETTERS.filter((letter) => materialsOf(letter).length === 0)).toEqual([]);
  });

  it('Given the reference When designations are read Then each one is written on the working list', () => {
    expect(
      MATERIALS.flatMap(({ slug, designations }) =>
        designations
          .filter(({ cite }) => cite.source !== WORKING_LIST || cite.basis !== 'stated')
          .map(({ value }) => `${slug}: ${value}`),
      ),
    ).toEqual([]);
  });

  it.each<[string, RegExp]>([
    ['material-number', /^\d\.\d{4}$/u],
    ['uns', /^[A-Z]\d{5}$/u],
  ])(
    'Given the reference When %s designations are read Then each follows its format',
    (system, format) => {
      expect(
        MATERIALS.flatMap(({ designations }) =>
          designations.filter(
            (designation) => designation.system === system && !format.test(designation.value),
          ),
        ).map(({ value }) => value),
      ).toEqual([]);
    },
  );

  it('Given the reference When behaviours are read Then each material has one to three, each the advice of its group on a Sandvik Coromant page', () => {
    expect(
      MATERIALS.filter(
        ({ behaviour }) =>
          behaviour.length > 3 ||
          behaviour.some(({ cite }) => cite.scope !== 'group' || !isSandvikPage(cite.source)),
      ).map(({ slug }) => slug),
    ).toEqual([]);
  });
});

const TURNING_FIELDS = ['Forme', 'Dépouille', 'Tolérance', 'Fixation et brise-copeaux'];

describe('RECOMMENDATIONS content', () => {
  it('Given the reference When external finishing is read Then every ISO group has a recommendation', () => {
    const covered = RECOMMENDATIONS.filter(({ operation }) => operation === 'external-finishing')
      .flatMap(({ materials }) => materials)
      .map(groupOf);

    expect(ISO_GROUP_LETTERS.filter((letter) => !covered.includes(letter))).toEqual([]);
  });

  it('Given the reference When an entry is read Then it lists every material of exactly one group, as group advice', () => {
    expect(
      RECOMMENDATIONS.filter((entry) => {
        const letters = [...new Set(entry.materials.map(groupOf))];
        const [letter] = letters;
        return (
          letters.length !== 1 ||
          letter === undefined ||
          [...entry.materials].sort().join() !== [...materialsOf(letter)].sort().join()
        );
      }).map(({ operation, materials }) => `${operation} × ${materials.join()}`),
    ).toEqual([]);
  });

  it('Given the reference When entries are read Then none gives a cutting speed', () => {
    expect(RECOMMENDATIONS.filter((entry) => entry.cuttingSpeed !== undefined)).toEqual([]);
  });

  it('Given the whole reference When its citations are read Then every deduced one points to a Sandvik Coromant page', () => {
    expect(
      citationsIn([ISO_513_GROUPS, MATERIALS, RECOMMENDATIONS])
        .filter(({ basis, source }) => basis === 'deduced' && !isSandvikPage(source))
        .map(({ source, locator }) => `${source}: ${locator}`),
    ).toEqual([]);
  });

  it('Given the turning entries When their codes are read Then each one reads shape, clearance, tolerance and fixing, each meaning written by the code table', () => {
    expect(
      RECOMMENDATIONS.flatMap(({ operation, insert }) =>
        insert.kind === 'iso-1832' &&
        (insert.fields.map(({ value }) => value.field).join() !== TURNING_FIELDS.join() ||
          insert.fields.some(({ cite }) => cite.basis !== 'stated' || isSandvikPage(cite.source)))
          ? [operation]
          : [],
      ),
    ).toEqual([]);
  });
});

const TRADE_NAMES: readonly RegExp[] = [
  /kyocera|mitsubishi|tungaloy|iscar|kennametal|\bseco\b|\bwalter\b|sumitomo|ceratizit/iu,
  /t-max|primeturning|xcel|safe-lok|silent tools|kenloc|kendex|top notch|logiq|heli turn/iu,
  /(?<![\p{L}\p{N}])(?:GC|CC|CB|KC|IC|MP|PDL|KYK|KS|KA|BXA|BXM|WBH|CH)\d{2,4}\p{Lu}?(?![\p{L}\p{N}])/u,
  /(?<![\p{L}\p{N}])\p{Lu}\d{2}\p{Lu}(?![\p{L}\p{N}])/u,
  /(?<![\p{L}\p{N}])-\p{Lu}{1,3}(?![\p{L}\p{N}])/u,
];

const tradeNamesIn = (value: unknown, name: string): readonly string[] =>
  editorialTexts(value, name)
    .filter(
      ({ path, text }) =>
        !CITED_SOURCE_ID.test(path) && TRADE_NAMES.some((pattern) => pattern.test(text)),
    )
    .map(({ path }) => path);

describe('trade names in recommendations', () => {
  it('Given RECOMMENDATIONS When its texts are read Then none names a maker, a tool system, a grade or a chip breaker', () => {
    expect(tradeNamesIn(RECOMMENDATIONS, 'RECOMMENDATIONS')).toEqual([]);
  });

  it.each<[string, unknown, readonly string[]]>([
    ['a maker', { grade: { value: 'Nuance fictive vue chez Kyocera' } }, ['sample.grade.value']],
    [
      'a tool system',
      { pitfalls: [{ value: 'Porte-outil T-Max fictif' }] },
      ['sample.pitfalls[0].value'],
    ],
    ['a grade', { grade: { value: 'Nuance GC4325 fictive' } }, ['sample.grade.value']],
    ['a short grade', { grade: { value: 'Nuance H13A fictive' } }, ['sample.grade.value']],
    [
      'a chip breaker',
      { geometry: [{ value: 'Brise-copeaux -PM fictif' }] },
      ['sample.geometry[0].value'],
    ],
  ])('Given %s When the guard reads it Then it is flagged', (_, value, paths) => {
    expect(tradeNamesIn(value, 'sample')).toEqual(paths);
  });

  it.each<[string, unknown]>([
    ['an ISO code', { value: 'CNMG, plaquette négative' }],
    ['a hardness and a percentage', { value: 'Au-delà de 55 HRC, ou de 13\u00a0% de silicium' }],
    ['a word with a hyphen', { value: 'Semi-finition et brise-copeaux' }],
    ['a second step', { value: 'Une seconde passe' }],
    ['the id of a catalogued source', { cite: { source: 'kyocera-fictif', locator: 'page B1' } }],
  ])('Given %s When the guard reads it Then it is not flagged', (_, value) => {
    expect(tradeNamesIn(value, 'sample')).toEqual([]);
  });
});
