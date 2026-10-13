import { PLATFORM_ID, type Provider } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SectionScroller } from '@core/navigation/section-scroller';
import { byTestId, testIdText } from '@shared/testing/by-test-id';
import { pressTestId } from '@shared/testing/press-test-id';
import { settle, settleBounded } from '@shared/testing/settle';
import { NEVER, defer, of, throwError, type Observable } from 'rxjs';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { BOOKING_FICHE } from '../../domain/booking-copy.static-data';
import { BookingGateway } from '../../domain/gateways/booking.gateway';
import type { BookingSlot } from '../../domain/models/booking.model';
import { aBookingSlot } from '../../testing/booking-builders';
import { radioLabel, radiosOf } from '../../testing/radio-label';
import { stubBookingGateway } from '../../testing/stub-booking-gateway';
import { Booking } from './booking';

const MONDAY_19_AT_9 = aBookingSlot({
  startsAt: '2026-10-19T07:00:00.000Z',
  endsAt: '2026-10-19T07:30:00.000Z',
});
const MONDAY_19_AT_930 = aBookingSlot({
  startsAt: '2026-10-19T07:30:00.000Z',
  endsAt: '2026-10-19T08:00:00.000Z',
});
const TUESDAY_20_AT_10 = aBookingSlot({
  startsAt: '2026-10-20T08:00:00.000Z',
  endsAt: '2026-10-20T08:30:00.000Z',
});
const MONDAY_26_AT_9 = aBookingSlot({
  startsAt: '2026-10-26T08:00:00.000Z',
  endsAt: '2026-10-26T08:30:00.000Z',
});
const TWO_WEEKS: readonly BookingSlot[] = [
  MONDAY_19_AT_9,
  MONDAY_19_AT_930,
  TUESDAY_20_AT_10,
  MONDAY_26_AT_9,
];

type GetSlots = Mock<BookingGateway['getSlots']>;

const later = <T>(value: T): Observable<T> => defer(() => of(value));

const serving = (...responses: readonly Observable<readonly BookingSlot[]>[]): GetSlots => {
  let call = 0;
  return vi.fn<BookingGateway['getSlots']>(() => responses[Math.min(call++, responses.length - 1)]);
};

type Rendered = {
  readonly fixture: ComponentFixture<Booking>;
  readonly host: HTMLElement;
};

async function renderPage(getSlots: GetSlots, extraProviders: Provider[] = []): Promise<Rendered> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: BookingGateway, useValue: stubBookingGateway({ getSlots }) },
      ...extraProviders,
    ],
  });
  const fixture = TestBed.createComponent(Booking);
  await settleBounded(fixture);
  return { fixture, host: fixture.nativeElement as HTMLElement };
}

const present = (host: HTMLElement, ...testIds: readonly string[]): Record<string, boolean> =>
  Object.fromEntries(testIds.map((testId) => [testId, byTestId(host, testId) !== null]));

const STATE_MARKERS = [
  'booking-slots-loading',
  'load-error',
  'booking-empty',
  'booking-day-picker',
] as const;

const normalized = (element: Element | null | undefined): string =>
  (element?.textContent ?? '').replace(/\s+/g, ' ').trim();

async function pickRadio(
  fixture: ComponentFixture<Booking>,
  testId: string,
  index: number,
): Promise<void> {
  radiosOf(fixture.nativeElement as HTMLElement, testId)[index]?.click();
  await settle(fixture);
}

describe('Booking', () => {
  describe('prerender and loading', () => {
    it('Given the page is prerendered on the server When rendered Then the fiche and the slot skeleton are there and no slot is requested', async () => {
      const getSlots = serving(later(TWO_WEEKS));

      const { host } = await renderPage(getSlots, [{ provide: PLATFORM_ID, useValue: 'server' }]);

      expect({
        calls: getSlots.mock.calls.length,
        fiche: byTestId(host, 'booking-fiche') !== null,
        ...present(host, ...STATE_MARKERS),
      }).toEqual({
        calls: 0,
        fiche: true,
        'booking-slots-loading': true,
        'load-error': false,
        'booking-empty': false,
        'booking-day-picker': false,
      });
    });

    it('Given the browser is waiting for the slots When rendered Then it shows the very skeleton the server prerendered', async () => {
      const server = await renderPage(serving(later(TWO_WEEKS)), [
        { provide: PLATFORM_ID, useValue: 'server' },
      ]);
      const prerendered = byTestId(server.host, 'booking-slots-loading')?.outerHTML;
      TestBed.resetTestingModule();

      const browser = await renderPage(serving(NEVER));

      expect({
        prerendered: prerendered !== undefined,
        same: byTestId(browser.host, 'booking-slots-loading')?.outerHTML === prerendered,
      }).toEqual({ prerendered: true, same: true });
    });
  });

  describe('fiche', () => {
    it('Given the page When rendered Then the cartouche titles the call and lists its fiche rows', async () => {
      const { host } = await renderPage(serving(NEVER));
      const fiche = byTestId(host, 'booking-fiche');
      const rows = [...(fiche?.querySelectorAll('[data-testid="cartouche-row"]') ?? [])].map(
        (row) => ({
          label: testIdText(row, 'cartouche-label'),
          value: testIdText(row, 'cartouche-value'),
        }),
      );

      expect({
        title: fiche === null ? null : testIdText(fiche, 'cartouche-title'),
        rows,
      }).toEqual({ title: BOOKING_FICHE.title, rows: BOOKING_FICHE.rows });
    });
  });

  describe('load states', () => {
    it('Given the slots failed to load When the visitor retries Then the slots are requested again and the days appear', async () => {
      const getSlots = serving(
        throwError(() => new Error('down')),
        later(TWO_WEEKS),
      );
      const { fixture, host } = await renderPage(getSlots);
      const failed = present(host, ...STATE_MARKERS);

      await pressTestId(fixture, 'load-error-retry');

      expect({
        failed,
        calls: getSlots.mock.calls.length,
        after: present(host, ...STATE_MARKERS),
      }).toEqual({
        failed: {
          'booking-slots-loading': false,
          'load-error': true,
          'booking-empty': false,
          'booking-day-picker': false,
        },
        calls: 2,
        after: {
          'booking-slots-loading': false,
          'load-error': false,
          'booking-empty': false,
          'booking-day-picker': true,
        },
      });
    });

    it('Given no free slot When loaded Then the empty state shows instead of the pickers', async () => {
      const { host } = await renderPage(serving(later([])));

      expect(present(host, ...STATE_MARKERS, 'booking-time-picker')).toEqual({
        'booking-slots-loading': false,
        'load-error': false,
        'booking-empty': true,
        'booking-day-picker': false,
        'booking-time-picker': false,
      });
    });

    it('Given no free slot When the visitor follows the empty state contact action Then the page scrolls to the contact form', async () => {
      const { fixture } = await renderPage(serving(later([])));
      const scrollTo = vi.spyOn(TestBed.inject(SectionScroller), 'scrollTo').mockReturnValue();

      await pressTestId(fixture, 'booking-empty-contact');

      expect(scrollTo.mock.calls).toEqual([['contact']]);
    });
  });

  describe('choosing a day and a time', () => {
    it('Given free slots When loaded Then the first week days are offered and no time yet', async () => {
      const { host } = await renderPage(serving(later(TWO_WEEKS)));

      expect({
        week: testIdText(host, 'booking-week-label'),
        days: radiosOf(host, 'booking-day-option').map(radioLabel),
        timePicker: byTestId(host, 'booking-time-picker') !== null,
      }).toEqual({
        week: 'Semaine du 19 octobre',
        days: ['lundi 19 octobre', 'mardi 20 octobre'],
        timePicker: false,
      });
    });

    it('Given a day is chosen When the times show Then each time of that day is a native radio named by its Paris wall time', async () => {
      const { fixture, host } = await renderPage(serving(later(TWO_WEEKS)));

      await pickRadio(fixture, 'booking-day-option', 0);
      const times = radiosOf(host, 'booking-time-option');

      expect({
        times: times.map((radio) => ({
          name: radioLabel(radio),
          value: radio.value,
          checked: radio.checked,
        })),
        sharedName: new Set(times.map((radio) => radio.name)).size === 1,
        legend: normalized(times[0]?.closest('fieldset')?.querySelector('legend')),
      }).toEqual({
        times: [
          { name: '09:00', value: MONDAY_19_AT_9.startsAt, checked: false },
          { name: '09:30', value: MONDAY_19_AT_930.startsAt, checked: false },
        ],
        sharedName: true,
        legend: 'lundi 19 octobre',
      });
    });

    it('Given a day is chosen When the visitor picks a time Then that time alone is checked', async () => {
      const { fixture, host } = await renderPage(serving(later(TWO_WEEKS)));
      await pickRadio(fixture, 'booking-day-option', 0);

      await pickRadio(fixture, 'booking-time-option', 1);

      expect(radiosOf(host, 'booking-time-option').map((radio) => radio.checked)).toEqual([
        false,
        true,
      ]);
    });

    it('Given a time is picked When the visitor changes day then comes back Then no time is checked any more', async () => {
      const { fixture, host } = await renderPage(serving(later(TWO_WEEKS)));
      await pickRadio(fixture, 'booking-day-option', 0);
      await pickRadio(fixture, 'booking-time-option', 1);

      await pickRadio(fixture, 'booking-day-option', 1);
      const otherDay = radiosOf(host, 'booking-time-option').map((radio) => radio.value);
      await pickRadio(fixture, 'booking-day-option', 0);

      expect({
        otherDay,
        checked: radiosOf(host, 'booking-time-option').filter((radio) => radio.checked).length,
      }).toEqual({ otherDay: [TUESDAY_20_AT_10.startsAt], checked: 0 });
    });

    it('Given two weeks When the visitor moves to the next week Then its days are offered and only going back stays possible', async () => {
      const { fixture, host } = await renderPage(serving(later(TWO_WEEKS)));
      const before = byTestId(host, 'booking-week-previous')?.getAttribute('aria-disabled');

      await pressTestId(fixture, 'booking-week-next');

      expect({
        before,
        week: testIdText(host, 'booking-week-label'),
        days: radiosOf(host, 'booking-day-option').map(radioLabel),
        previous: byTestId(host, 'booking-week-previous')?.getAttribute('aria-disabled'),
        next: byTestId(host, 'booking-week-next')?.getAttribute('aria-disabled'),
      }).toEqual({
        before: 'true',
        week: 'Semaine du 26 octobre',
        days: ['lundi 26 octobre'],
        previous: null,
        next: 'true',
      });
    });
  });

  describe('page structure', () => {
    it('Given the page inside the shell When rendered Then it has a single h1 and leaves the landmarks to the shell', async () => {
      const { host } = await renderPage(serving(later(TWO_WEEKS)));

      expect({
        h1: host.querySelectorAll('h1').length,
        landmarks: host.querySelectorAll('header, main, footer').length,
      }).toEqual({ h1: 1, landmarks: 0 });
    });
  });
});
