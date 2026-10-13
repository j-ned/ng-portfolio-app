import { describe, expect, it } from 'vitest';
import {
  BOOKING_FAILURE_MESSAGES,
  BOOKING_FICHE,
  BOOKING_FORMAT_LABELS,
} from './booking-copy.static-data';

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

describe('BOOKING_FORMAT_LABELS', () => {
  it('names both call formats', () => {
    expect(BOOKING_FORMAT_LABELS).toEqual({ video: 'Visio', phone: 'Téléphone' });
  });
});

describe('BOOKING_FAILURE_MESSAGES', () => {
  it('tells the visitor what happened and what to do next for every refusal', () => {
    expect(BOOKING_FAILURE_MESSAGES).toEqual({
      'slot-taken':
        'Ce créneau vient d’être réservé. Choisissez un autre horaire : vos coordonnées sont conservées.',
      'slot-unavailable':
        'Ce créneau n’est plus disponible. Choisissez un autre horaire : vos coordonnées sont conservées.',
      'limit-reached':
        'Vous avez déjà deux rendez-vous à venir avec cette adresse. Annulez-en un depuis son email de confirmation pour en réserver un autre.',
      'rate-limited': 'Trop de tentatives en peu de temps. Réessayez dans quelques minutes.',
      invalid:
        'Certaines informations n’ont pas été acceptées. Vérifiez le formulaire puis réessayez.',
      network: 'La connexion a échoué. Vérifiez votre réseau puis réessayez.',
      server:
        'Le service de réservation ne répond pas. Réessayez dans un instant ou écrivez-moi via le formulaire de contact.',
    });
  });
});
