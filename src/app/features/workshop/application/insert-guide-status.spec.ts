import { describe, expect, it } from 'vitest';
import type { Material } from '../domain/models/material.model';
import type { Operation } from '../domain/models/operation.model';
import { aMaterialCatalogue, anOperation } from '../testing/insert-guide-builders';
import { INSERT_GUIDE_COPY } from './insert-guide-copy';
import { insertGuideStatus } from './insert-guide-status';

const [ALPHA, BETA] = aMaterialCatalogue();
const FINISHING = anOperation('external-finishing', { label: 'Finition fictive' });
const GROOVING = anOperation('grooving', { label: 'Gorge fictive' });

describe('insertGuideStatus', () => {
  it('Given an incomplete selection When the status is derived Then nothing is announced', () => {
    expect(insertGuideStatus({ status: 'incomplete' })).toBe('');
  });

  it.each<[Material, Operation, string]>([
    [ALPHA, FINISHING, 'Alliage essai Alpha, Finition fictive.'],
    [BETA, FINISHING, 'Alliage essai Bêta, Finition fictive.'],
    [ALPHA, GROOVING, 'Alliage essai Alpha, Gorge fictive.'],
  ])(
    'Given %#: a combination without recommendation When the status is derived Then it names the material and the operation, then says there is no recommendation yet',
    (material, operation, named) => {
      expect(insertGuideStatus({ status: 'unavailable', material, operation })).toBe(
        `${named} ${INSERT_GUIDE_COPY.unavailable}`,
      );
    },
  );
});
