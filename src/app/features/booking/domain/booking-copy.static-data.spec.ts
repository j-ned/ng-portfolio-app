import { describe, expect, it } from 'vitest';
import { BOOKING_FICHE } from './booking-copy.static-data';

describe('BOOKING_FICHE', () => {
  it('describes the single bookable call, its length, format, price and time zone', () => {
    expect(BOOKING_FICHE).toEqual({
      title: 'Appel de cadrage · 30 min',
      rows: [
        { label: 'Durée', value: '30 min' },
        { label: 'Format', value: 'Visio ou téléphone' },
        { label: 'Tarif', value: 'Gratuit' },
        { label: 'Fuseau', value: 'Heure de Paris' },
      ],
    });
  });
});
