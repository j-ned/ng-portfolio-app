import { describe, expect, it } from 'vitest';
import { aCitation, anIsoInsertField, anIsoInsert } from '../testing/insert-guide-builders';
import { isoInsertCode } from './iso-insert-code';
import type { IsoInsertDesignation } from './models/recommendation.model';

describe('isoInsertCode', () => {
  it.each<[string, IsoInsertDesignation, string]>([
    ['a single field', anIsoInsert(), 'Z'],
    [
      'four fields',
      {
        kind: 'iso-1832',
        choice: [aCitation()],
        fields: [
          anIsoInsertField('Champ fictif 1', 'Q', 'Sens fictif 1'),
          anIsoInsertField('Champ fictif 2', 'Z', 'Sens fictif 2'),
          anIsoInsertField('Champ fictif 3', 'X', 'Sens fictif 3'),
          anIsoInsertField('Champ fictif 4', 'W', 'Sens fictif 4'),
        ],
      },
      'QZXW',
    ],
    [
      'a field coded on two characters',
      {
        kind: 'iso-1832',
        choice: [aCitation()],
        fields: [
          anIsoInsertField('Champ fictif 1', 'Q', 'Sens fictif 1'),
          anIsoInsertField('Champ fictif 2', '09', 'Sens fictif 2'),
        ],
      },
      'Q09',
    ],
  ])(
    'Given an ISO designation with %s When its code is read Then it is the field codes joined in order',
    (_, insert, code) => {
      expect(isoInsertCode(insert)).toBe(code);
    },
  );
});
