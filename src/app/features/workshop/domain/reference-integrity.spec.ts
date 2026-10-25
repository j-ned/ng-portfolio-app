import { describe, expect, it } from 'vitest';
import { MATERIALS } from './materials.static-data';
import type { Material } from './models/material.model';
import { normalizeDesignation } from './normalize-designation';

const SLUG_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const duplicates = (values: readonly string[]): readonly string[] => [
  ...new Set(values.filter((value, index) => values.indexOf(value) !== index)),
];

const sourcedTexts = (material: Material): readonly string[] => [
  ...material.designations.flatMap((designation) => [designation.value, designation.cite.locator]),
  material.isoGroup.cite.locator,
  ...material.behaviour.flatMap((line) => [line.value, line.cite.locator]),
];

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
