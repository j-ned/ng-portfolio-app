import { describe, expect, it } from 'vitest';
import { aSource } from '../testing/insert-guide-builders';
import { MATERIALS } from './materials.static-data';
import type { Material } from './models/material.model';
import type { Source } from './models/source.model';
import { normalizeDesignation } from './normalize-designation';
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
