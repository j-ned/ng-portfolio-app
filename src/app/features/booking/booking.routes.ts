import type { Routes } from '@angular/router';
import { SITE_IDENTITY } from '@shared/identity/site-identity.static-data';
import { Booking } from './pages/booking/booking';

const BOOKING_TITLE = 'Prendre rendez-vous, appel de cadrage gratuit | Julien Nédellec';
const BOOKING_URL = `${SITE_IDENTITY.siteUrl}/rendez-vous`;

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    title: BOOKING_TITLE,
    component: Booking,
    data: {
      seo: {
        title: BOOKING_TITLE,
        description:
          'Réservez en ligne un appel de cadrage gratuit de 30 minutes, en visio ou par téléphone, pour parler de votre site ou de votre application.',
        url: BOOKING_URL,
        type: 'website',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_IDENTITY.siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Prendre rendez-vous', item: BOOKING_URL },
          ],
        },
      },
    },
  },
];
