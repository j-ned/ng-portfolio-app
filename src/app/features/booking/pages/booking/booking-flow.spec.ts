import { ApplicationRef, PLATFORM_ID, type Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NEVER, defer, of, throwError, type Observable } from 'rxjs';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { BookingGateway } from '../../domain/gateways/booking.gateway';
import type { BookingSlot } from '../../domain/models/booking.model';
import { aBookingSlot } from '../../testing/booking-builders';
import { stubBookingGateway } from '../../testing/stub-booking-gateway';
import { BookingFlow } from './booking-flow';

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
const TWO_WEEKS: readonly BookingSlot[] = [MONDAY_19_AT_9, TUESDAY_20_AT_10, MONDAY_26_AT_9];

type GetSlots = Mock<BookingGateway['getSlots']>;

const later = <T>(value: T): Observable<T> => defer(() => of(value));

const serving = (...responses: readonly Observable<readonly BookingSlot[]>[]): GetSlots => {
  let call = 0;
  return vi.fn<BookingGateway['getSlots']>(() => responses[Math.min(call++, responses.length - 1)]);
};

// Une ressource en attente (`NEVER`) garde l'application instable : la macro-tâche borne l'attente.
async function flush(): Promise<void> {
  TestBed.tick();
  await Promise.race([
    TestBed.inject(ApplicationRef).whenStable(),
    new Promise<void>((resolve) => setTimeout(resolve, 0)),
  ]);
  TestBed.tick();
}

async function openFlow(getSlots: GetSlots, extraProviders: Provider[] = []): Promise<BookingFlow> {
  TestBed.configureTestingModule({
    providers: [
      BookingFlow,
      { provide: BookingGateway, useValue: stubBookingGateway({ getSlots }) },
      ...extraProviders,
    ],
  });
  const flow = TestBed.inject(BookingFlow);
  await flush();
  return flow;
}

const weekKeys = (flow: BookingFlow): readonly string[] => flow.weeks().map((week) => week.key);

describe('BookingFlow', () => {
  describe('loading the free slots', () => {
    it('Given the page is prerendered on the server When the flow starts Then the slots are never requested and the flow stays loading', async () => {
      const getSlots = serving(later(TWO_WEEKS));

      const flow = await openFlow(getSlots, [{ provide: PLATFORM_ID, useValue: 'server' }]);

      expect({
        calls: getSlots.mock.calls.length,
        state: flow.state(),
        weeks: flow.weeks(),
      }).toEqual({
        calls: 0,
        state: 'loading',
        weeks: [],
      });
    });

    it('Given the slots are on their way When the flow starts in the browser Then it is loading after one request', async () => {
      const getSlots = serving(NEVER);

      const flow = await openFlow(getSlots);

      expect({ calls: getSlots.mock.calls.length, state: flow.state() }).toEqual({
        calls: 1,
        state: 'loading',
      });
    });

    it('Given no free slot When loaded Then the flow is empty', async () => {
      const flow = await openFlow(serving(later([])));

      expect({ state: flow.state(), week: flow.currentWeek() }).toEqual({
        state: 'empty',
        week: null,
      });
    });

    it('Given free slots over two weeks When loaded Then the flow is ready on the first week', async () => {
      const flow = await openFlow(serving(later(TWO_WEEKS)));

      expect({
        state: flow.state(),
        weeks: weekKeys(flow),
        current: flow.currentWeek()?.label,
        days: flow.currentWeek()?.days.map((day) => day.label),
      }).toEqual({
        state: 'ready',
        weeks: ['2026-10-19', '2026-10-26'],
        current: 'Semaine du 19 octobre',
        days: ['lundi 19 octobre', 'mardi 20 octobre'],
      });
    });

    it('Given the slots failed to load When the visitor retries Then a second request brings the flow to ready', async () => {
      const getSlots = serving(
        throwError(() => new Error('down')),
        later(TWO_WEEKS),
      );
      const flow = await openFlow(getSlots);
      const failed = flow.state();

      flow.reloadSlots();
      await flush();

      expect({ failed, calls: getSlots.mock.calls.length, state: flow.state() }).toEqual({
        failed: 'error',
        calls: 2,
        state: 'ready',
      });
    });
  });

  describe('week navigation', () => {
    it('Given two weeks When the visitor moves forward then back Then the shown week and both bounds follow', async () => {
      const flow = await openFlow(serving(later(TWO_WEEKS)));
      const bounds = (): readonly [string | undefined, boolean, boolean] => [
        flow.currentWeek()?.key,
        flow.hasPreviousWeek(),
        flow.hasNextWeek(),
      ];
      const atStart = bounds();

      flow.showNextWeek();
      const atEnd = bounds();
      flow.showPreviousWeek();

      expect([atStart, atEnd, bounds()]).toEqual([
        ['2026-10-19', false, true],
        ['2026-10-26', true, false],
        ['2026-10-19', false, true],
      ]);
    });

    it('Given the last week is shown When the visitor asks for the next one Then the last week stays shown', async () => {
      const flow = await openFlow(serving(later(TWO_WEEKS)));

      flow.showNextWeek();
      flow.showNextWeek();

      expect(flow.currentWeek()?.key).toBe('2026-10-26');
    });

    it('Given the first week is shown When the visitor asks for the previous one Then the first week stays shown', async () => {
      const flow = await openFlow(serving(later(TWO_WEEKS)));

      flow.showNextWeek();
      flow.showPreviousWeek();
      flow.showPreviousWeek();

      expect(flow.currentWeek()?.key).toBe('2026-10-19');
    });

    it('Given a day and a time are chosen When the visitor moves to the next week and back Then both stay chosen', async () => {
      const flow = await openFlow(serving(later(TWO_WEEKS)));
      flow.selectDay('2026-10-19');
      flow.form.startsAt().value.set(MONDAY_19_AT_9.startsAt);

      flow.showNextWeek();
      const onNextWeek = [
        flow.currentWeek()?.key,
        flow.selectedDate(),
        flow.form.startsAt().value(),
      ];
      flow.showPreviousWeek();

      expect({
        onNextWeek,
        back: [flow.selectedDate(), flow.form.startsAt().value()],
      }).toEqual({
        onNextWeek: ['2026-10-26', '2026-10-19', MONDAY_19_AT_9.startsAt],
        back: ['2026-10-19', MONDAY_19_AT_9.startsAt],
      });
    });

    it('Given the second week is shown When a reload leaves a single week Then the shown week falls back to it', async () => {
      const flow = await openFlow(serving(later(TWO_WEEKS), later([MONDAY_19_AT_9])));
      flow.showNextWeek();

      flow.reloadSlots();
      await flush();

      expect({ week: flow.currentWeek()?.key, next: flow.hasNextWeek() }).toEqual({
        week: '2026-10-19',
        next: false,
      });
    });
  });

  describe('day and time selection', () => {
    it('Given nothing chosen yet When the visitor picks a day Then that day is selected with its own times and no time', async () => {
      const flow = await openFlow(serving(later(TWO_WEEKS)));
      const before = [flow.selectedDate(), flow.selectedDay()];

      flow.selectDay('2026-10-20');

      expect({
        before,
        date: flow.selectedDate(),
        label: flow.selectedDay()?.label,
        times: flow.selectedDay()?.slots.map((slot) => slot.timeLabel),
        time: flow.form.startsAt().value(),
      }).toEqual({
        before: [null, null],
        date: '2026-10-20',
        label: 'mardi 20 octobre',
        times: ['10:00'],
        time: '',
      });
    });

    it('Given a time is chosen When the visitor changes day Then the time is cleared', async () => {
      const flow = await openFlow(serving(later(TWO_WEEKS)));
      flow.selectDay('2026-10-19');
      flow.form.startsAt().value.set(MONDAY_19_AT_9.startsAt);
      const chosen = flow.form.startsAt().value();

      flow.selectDay('2026-10-20');

      expect({ chosen, after: flow.form.startsAt().value() }).toEqual({
        chosen: MONDAY_19_AT_9.startsAt,
        after: '',
      });
    });

    it('Given a chosen day vanishes from a reload When the slots come back Then neither a day nor a time is selected any more', async () => {
      const flow = await openFlow(serving(later(TWO_WEEKS), later([TUESDAY_20_AT_10])));
      flow.selectDay('2026-10-19');
      flow.form.startsAt().value.set(MONDAY_19_AT_9.startsAt);
      const before = [flow.selectedDate(), flow.form.startsAt().value()];

      flow.reloadSlots();
      await flush();

      expect({
        before,
        date: flow.selectedDate(),
        day: flow.selectedDay(),
        time: flow.form.startsAt().value(),
      }).toEqual({
        before: ['2026-10-19', MONDAY_19_AT_9.startsAt],
        date: null,
        day: null,
        time: '',
      });
    });

    it('Given only the chosen time vanishes from a reload When the slots come back Then the day stays selected and the time is cleared', async () => {
      const flow = await openFlow(
        serving(later(TWO_WEEKS), later([MONDAY_19_AT_930, TUESDAY_20_AT_10])),
      );
      flow.selectDay('2026-10-19');
      flow.form.startsAt().value.set(MONDAY_19_AT_9.startsAt);

      flow.reloadSlots();
      await flush();

      expect({
        date: flow.selectedDate(),
        times: flow.selectedDay()?.slots.map((slot) => slot.timeLabel),
        time: flow.form.startsAt().value(),
      }).toEqual({ date: '2026-10-19', times: ['09:30'], time: '' });
    });

    it('Given the chosen day and time survive a reload When the slots come back Then both stay selected', async () => {
      const flow = await openFlow(serving(later(TWO_WEEKS), later([TUESDAY_20_AT_10])));
      flow.selectDay('2026-10-20');
      flow.form.startsAt().value.set(TUESDAY_20_AT_10.startsAt);

      flow.reloadSlots();
      await flush();

      expect({ date: flow.selectedDate(), time: flow.form.startsAt().value() }).toEqual({
        date: '2026-10-20',
        time: TUESDAY_20_AT_10.startsAt,
      });
    });
  });
});
