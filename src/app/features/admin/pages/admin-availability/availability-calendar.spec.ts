import { TestBed } from '@angular/core/testing';
import { NEVER, Subject, defer, of, throwError, type Observable } from 'rxjs';
import type { Mock } from 'vitest';
import { BookingGateway } from '@features/booking/domain/gateways/booking.gateway';
import type { CalendarMonth } from '@features/booking/domain/models/booking-admin.model';
import { stubBookingGateway } from '@features/booking/testing/stub-booking-gateway';
import type { LoadState } from '@shared/ui/load-state';
import { aCalendarMonthOf } from '../../application/testing/calendar-month-builder';
import { AvailabilityCalendar } from './availability-calendar';

const NOVEMBER = aCalendarMonthOf('2026-11');
const DECEMBER = aCalendarMonthOf('2026-12', { previousMonth: '2026-11', nextMonth: '2027-01' });

type Calendar = {
  readonly calendar: AvailabilityCalendar;
  readonly read: Mock<BookingGateway['getAvailabilityCalendar']>;
};

const byMonth = (month: string | null): Observable<CalendarMonth> =>
  defer(() => of(month === '2026-12' ? DECEMBER : NOVEMBER));

async function flush(): Promise<void> {
  for (let pass = 0; pass < 2; pass++) {
    TestBed.tick();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  TestBed.tick();
}

async function openCalendar(
  read: BookingGateway['getAvailabilityCalendar'] = byMonth,
): Promise<Calendar> {
  const spy = vi.fn<BookingGateway['getAvailabilityCalendar']>(read);
  TestBed.configureTestingModule({
    providers: [
      AvailabilityCalendar,
      { provide: BookingGateway, useValue: stubBookingGateway({ getAvailabilityCalendar: spy }) },
    ],
  });
  const calendar = TestBed.inject(AvailabilityCalendar);
  await flush();
  return { calendar, read: spy };
}

type Shown = {
  readonly state: LoadState;
  readonly busy: boolean;
  readonly month: string | null;
  readonly label: string | null;
};

const shown = ({ calendar }: Calendar): Shown => ({
  state: calendar.state(),
  busy: calendar.busy(),
  month: calendar.view()?.month ?? null,
  label: calendar.view()?.label ?? null,
});

describe('AvailabilityCalendar: lecture du mois', () => {
  it('Given the screen opens When the calendar starts Then it reads the current month once, without naming it, and shows it ready', async () => {
    const opened = await openCalendar();

    expect({
      calls: opened.read.mock.calls,
      ...shown(opened),
      weeks: opened.calendar.view()?.weeks.length,
      focusDate: opened.calendar.focusDate(),
    }).toEqual({
      calls: [[null]],
      state: 'ready',
      busy: false,
      month: '2026-11',
      label: 'Novembre 2026',
      weeks: 6,
      focusDate: null,
    });
  });

  it('Given the month is still on its way When the calendar starts Then it is loading with nothing to show', async () => {
    const opened = await openCalendar(() => NEVER);

    expect(shown(opened)).toEqual({ state: 'loading', busy: false, month: null, label: null });
  });

  it('Given the month failed to load When the calendar starts Then it reports an error', async () => {
    const opened = await openCalendar(() => throwError(() => new Error('offline')));

    expect(shown(opened)).toEqual({ state: 'error', busy: false, month: null, label: null });
  });

  it('Given the month failed to load When it is reloaded Then the same month is read again and shown', async () => {
    let attempts = 0;
    const opened = await openCalendar((month) =>
      defer(() => {
        attempts += 1;
        return attempts === 1 ? throwError(() => new Error('offline')) : byMonth(month);
      }),
    );

    opened.calendar.reload();
    await flush();

    expect({ calls: opened.read.mock.calls, ...shown(opened) }).toEqual({
      calls: [[null], [null]],
      state: 'ready',
      busy: false,
      month: '2026-11',
      label: 'Novembre 2026',
    });
  });
});

describe('AvailabilityCalendar: navigation', () => {
  it('Given November When December is asked with a day to focus Then December is read by name, shown, and that day is the one to focus', async () => {
    const opened = await openCalendar();

    opened.calendar.goToMonth('2026-12', '2026-12-12');
    await flush();

    expect({
      calls: opened.read.mock.calls,
      ...shown(opened),
      focusDate: opened.calendar.focusDate(),
    }).toEqual({
      calls: [[null], ['2026-12']],
      state: 'ready',
      busy: false,
      month: '2026-12',
      label: 'Décembre 2026',
      focusDate: '2026-12-12',
    });
  });

  it('Given November When December is asked without a day to focus Then nothing is to focus', async () => {
    const opened = await openCalendar();

    opened.calendar.goToMonth('2026-12', null);
    await flush();

    expect({
      month: opened.calendar.view()?.month,
      focusDate: opened.calendar.focusDate(),
    }).toEqual({ month: '2026-12', focusDate: null });
  });

  it('Given December on its way When it is not answered yet Then November stays shown, busy, never back to the loading placeholder, until December arrives', async () => {
    const december = new Subject<CalendarMonth>();
    const opened = await openCalendar((month) => (month === '2026-12' ? december : byMonth(month)));

    opened.calendar.goToMonth('2026-12', '2026-12-12');
    await flush();
    const meanwhile = shown(opened);
    december.next(DECEMBER);
    december.complete();
    await flush();

    expect({ meanwhile, after: shown(opened) }).toEqual({
      meanwhile: { state: 'ready', busy: true, month: '2026-11', label: 'Novembre 2026' },
      after: { state: 'ready', busy: false, month: '2026-12', label: 'Décembre 2026' },
    });
  });

  it('Given December shown When November is asked back Then it is read by name and shown', async () => {
    const opened = await openCalendar();

    opened.calendar.goToMonth('2026-12', null);
    await flush();
    opened.calendar.goToMonth('2026-11', '2026-11-30');
    await flush();

    expect({
      calls: opened.read.mock.calls,
      month: opened.calendar.view()?.month,
      focusDate: opened.calendar.focusDate(),
    }).toEqual({
      calls: [[null], ['2026-12'], ['2026-11']],
      month: '2026-11',
      focusDate: '2026-11-30',
    });
  });

  it('Given December shown When it is reloaded Then December is read again by name', async () => {
    const opened = await openCalendar();

    opened.calendar.goToMonth('2026-12', null);
    await flush();
    opened.calendar.reload();
    await flush();

    expect(opened.read.mock.calls).toEqual([[null], ['2026-12'], ['2026-12']]);
  });
});
