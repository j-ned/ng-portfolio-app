import { describe, expect, it } from 'vitest';
import type { Material } from '../domain/models/material.model';
import type { Operation, OperationFamily } from '../domain/models/operation.model';
import type {
  IsoInsertDesignation,
  RecommendationEntry,
} from '../domain/models/recommendation.model';
import {
  aMaterialCatalogue,
  anIsoInsertField,
  anOperation,
  anOperationFamily,
  aRecommendation,
} from '../testing/insert-guide-builders';
import { INSERT_GUIDE_COPY } from './insert-guide-copy';
import { insertGuideStatus } from './insert-guide-status';

const [ALPHA, BETA] = aMaterialCatalogue();
const OUTER_FINISHING = anOperation('external-finishing', { label: 'Finition fictive' });
const INNER_FINISHING = anOperation('internal-finishing', { label: 'Finition fictive' });
const GROOVING = anOperation('grooving', { label: 'Gorge fictive' });

const FAMILIES: readonly OperationFamily[] = [
  anOperationFamily({
    id: 'external-turning',
    label: 'Extérieur fictif',
    operations: [OUTER_FINISHING],
  }),
  anOperationFamily({
    id: 'internal-turning',
    label: 'Intérieur fictif',
    operations: [INNER_FINISHING],
  }),
  anOperationFamily({ id: 'grooving-parting', label: 'Gorges fictives', operations: [GROOVING] }),
];

describe('insertGuideStatus', () => {
  it('Given an incomplete selection When the status is derived Then nothing is announced', () => {
    expect(insertGuideStatus({ status: 'incomplete' }, FAMILIES)).toBe('');
  });

  it.each<[Material, Operation, string]>([
    [ALPHA, GROOVING, 'Alliage essai Alpha, Gorge fictive.'],
    [BETA, GROOVING, 'Alliage essai Bêta, Gorge fictive.'],
    [ALPHA, OUTER_FINISHING, 'Alliage essai Alpha, Finition fictive (Extérieur fictif).'],
    [ALPHA, INNER_FINISHING, 'Alliage essai Alpha, Finition fictive (Intérieur fictif).'],
  ])(
    'Given %#: a combination without recommendation When the status is derived Then it names the material and the operation, with its family when the label is shared, then says there is no recommendation yet',
    (material, operation, named) => {
      expect(insertGuideStatus({ status: 'unavailable', material, operation }, FAMILIES)).toBe(
        `${named} ${INSERT_GUIDE_COPY.unavailable}`,
      );
    },
  );

  const ZQ_INSERT: IsoInsertDesignation = {
    kind: 'iso-1832',
    fields: [
      anIsoInsertField('Forme fictive', 'Z', 'Losange fictif'),
      anIsoInsertField('Dépouille fictive', 'Q', 'Angle fictif'),
    ],
  };

  it.each<[Material, Operation, RecommendationEntry, string]>([
    [
      ALPHA,
      OUTER_FINISHING,
      aRecommendation('external-finishing', { materials: [ALPHA.slug], insert: ZQ_INSERT }),
      'Alliage essai Alpha, Finition fictive (Extérieur fictif).',
    ],
    [
      BETA,
      INNER_FINISHING,
      aRecommendation('internal-finishing', { materials: [BETA.slug], insert: ZQ_INSERT }),
      'Alliage essai Bêta, Finition fictive (Intérieur fictif).',
    ],
  ])(
    'Given %#: an available recommendation When the status is derived Then it names the material and the operation, then the proposed insert code',
    (material, operation, entry, named) => {
      expect(insertGuideStatus({ status: 'available', material, operation, entry }, FAMILIES)).toBe(
        `${named} Plaquette proposée\u00a0: ZQ.`,
      );
    },
  );

  it('Given an available recommendation for a described insert When the status is derived Then it names the case, the insert having no code to announce', () => {
    const entry = aRecommendation('grooving', { materials: [ALPHA.slug] });

    expect(
      insertGuideStatus(
        { status: 'available', material: ALPHA, operation: GROOVING, entry },
        FAMILIES,
      ),
    ).toBe('Alliage essai Alpha, Gorge fictive.');
  });
});
