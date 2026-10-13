export type BookingFicheRow = { readonly label: string; readonly value: string };

export type BookingFiche = { readonly title: string; readonly rows: readonly BookingFicheRow[] };

export const BOOKING_FICHE: BookingFiche = {
  title: 'Appel de cadrage · 30 min',
  rows: [
    { label: 'Durée', value: '30 min' },
    { label: 'Format', value: 'Visio ou téléphone' },
    { label: 'Tarif', value: 'Gratuit' },
    { label: 'Fuseau', value: 'Heure de Paris' },
  ],
};

export const BOOKING_PAGE_COPY = {
  heading: 'Prendre rendez-vous',
  lead: 'Trente minutes pour parler de votre projet : le besoin, le délai, le budget. Vous repartez avec une première orientation, sans engagement.',
  ficheReference: 'réf. RDV-30',
  ficheDimension: 'de votre question à une première orientation',
  slotsHeading: 'Choisir un créneau',
  slotsLead: 'Les horaires affichés sont à l’heure de Paris.',
  loadError: 'Les créneaux n’ont pas pu être chargés.',
  emptyTitle: 'Aucun créneau libre pour le moment.',
  emptyDetail: 'Écrivez-moi via le formulaire de contact\u00a0: je vous réponds sous 48 h ouvrées.',
  emptyAction: 'Écrire un message',
} as const;
