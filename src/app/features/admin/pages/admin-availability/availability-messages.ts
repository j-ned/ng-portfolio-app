import type { BookingAdminFailure } from '@features/booking/domain/models/booking-admin.model';

const SAVE_FAILURES: Partial<Record<BookingAdminFailure, string>> = {
  invalid: 'Les plages ont été refusées : vérifiez les heures, puis réessayez.',
  network: 'Enregistrement impossible : vérifiez votre connexion, puis réessayez.',
};
const SAVE_SERVER_FAILURE =
  "Enregistrement impossible : le serveur n'a pas répondu. Réessayez dans un instant.";

const CREATE_FAILURES: Partial<Record<BookingAdminFailure, string>> = {
  invalid: 'La fermeture a été refusée : vérifiez les dates, puis réessayez.',
  network: 'Ajout impossible : vérifiez votre connexion, puis réessayez.',
};
const CREATE_SERVER_FAILURE =
  "Ajout impossible : le serveur n'a pas répondu. Réessayez dans un instant.";

const DELETE_FAILURES: Partial<Record<BookingAdminFailure, string>> = {
  'not-found': "Cette fermeture n'existe plus. Rechargez la page.",
  network: 'Suppression impossible : vérifiez votre connexion, puis réessayez.',
};
const DELETE_SERVER_FAILURE =
  "Suppression impossible : le serveur n'a pas répondu. Réessayez dans un instant.";

export const saveFailureMessage = (reason: BookingAdminFailure | null): string =>
  (reason && SAVE_FAILURES[reason]) ?? SAVE_SERVER_FAILURE;

export const createFailureMessage = (reason: BookingAdminFailure): string =>
  CREATE_FAILURES[reason] ?? CREATE_SERVER_FAILURE;

export const deleteFailureMessage = (reason: BookingAdminFailure): string =>
  DELETE_FAILURES[reason] ?? DELETE_SERVER_FAILURE;
