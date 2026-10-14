import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { ToastStore } from '@core/notifications/toast-store';
import { BookingGateway } from '@features/booking/domain/gateways/booking.gateway';
import type {
  CalendarDay,
  CalendarMonth,
} from '@features/booking/domain/models/booking-admin.model';
import { toParisDateKey } from '@features/booking/domain/paris-format';
import type { LoadState } from '@shared/ui/load-state';
import {
  announceDay,
  isActionable,
  type BookingWarning,
  toCalendarMonthView,
  wantsOpen,
} from '../../application/calendar-month-view';
import { dayFailureMessage, holidaysFailureMessage } from './availability-messages';

const without = (dates: ReadonlySet<string>, date: string): ReadonlySet<string> =>
  new Set([...dates].filter((candidate) => candidate !== date));

@Injectable()
export class AvailabilityCalendar {
  private readonly gateway = inject(BookingGateway);
  private readonly toast = inject(ToastStore);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _month = signal<string | null>(null);
  private readonly _focusDate = signal<string | null>(null);
  // Écrit à chaque réponse plutôt que dérivé de la ressource : changer de mois vide sa valeur, et un
  // `linkedSignal` jamais lu avant ce changement n'aurait aucun mois précédent à garder.
  private readonly _shown = signal<CalendarMonth | null>(null);
  private readonly _pending = signal<ReadonlySet<string>>(new Set());
  private readonly _holidaysSaving = signal(false);
  private readonly _announcement = signal('');
  private readonly _bookingWarning = signal<BookingWarning | null>(null);

  private readonly monthResource = rxResource({
    params: () => ({ month: this._month() }),
    stream: ({ params }) =>
      this.gateway
        .getAvailabilityCalendar(params.month)
        .pipe(tap((month) => this._shown.set(month))),
  });

  private readonly upcomingBookings = rxResource({
    stream: () => this.gateway.getBookings('upcoming'),
  });

  private readonly bookingsByDate = computed(() => {
    const counts = new Map<string, number>();
    if (!this.upcomingBookings.hasValue()) return counts;
    for (const booking of this.upcomingBookings.value()) {
      if (booking.status !== 'confirmed') continue;
      const date = toParisDateKey(booking.startsAt);
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }
    return counts;
  });

  readonly view = computed(() => {
    const shown = this._shown();
    return shown && toCalendarMonthView(shown);
  });
  readonly state = computed<LoadState>(() => {
    if (this.monthResource.status() === 'error') return 'error';
    return this._shown() === null ? 'loading' : 'ready';
  });
  readonly busy = computed(() => this.monthResource.isLoading() && this._shown() !== null);
  readonly focusDate = this._focusDate.asReadonly();
  readonly pending = this._pending.asReadonly();
  readonly holidaysSaving = this._holidaysSaving.asReadonly();
  readonly announcement = this._announcement.asReadonly();
  readonly bookingWarning = this._bookingWarning.asReadonly();

  goToMonth(month: string, focusDate: string | null): void {
    this._focusDate.set(focusDate);
    this._month.set(month);
  }

  // La date de navigation ne sert qu'une fois : gardée, elle reprendrait le focus à chaque nouvelle vue.
  reload(): void {
    this._focusDate.set(null);
    this.monthResource.reload();
  }

  toggleDay(date: string): void {
    const day = this._shown()?.days.find((candidate) => candidate.date === date);
    if (day === undefined || !isActionable(day) || this._pending().has(date)) return;
    this._focusDate.set(null);
    this._pending.update((dates) => new Set([...dates, date]));
    this.gateway
      .setDayOpen(date, wantsOpen(day))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this._pending.update((dates) => without(dates, date));
        if (!result.success) {
          this.toast.add({ severity: 'error', detail: dayFailureMessage(result.reason) });
          if (result.reason === 'day-past' || result.reason === 'day-in-closure') {
            this.monthResource.reload();
          }
          return;
        }
        this.replaceDay(result.data);
        this._announcement.set(announceDay(result.data));
        this._bookingWarning.set(this.warningFor(result.data));
      });
  }

  setHolidaysClosed(value: boolean): void {
    if (this._holidaysSaving()) return;
    this._focusDate.set(null);
    this._holidaysSaving.set(true);
    this.gateway
      .setClosePublicHolidays(value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this._holidaysSaving.set(false);
        if (!result.success) {
          this.toast.add({ severity: 'error', detail: holidaysFailureMessage(result.reason) });
          return;
        }
        this.monthResource.reload();
        this._announcement.set(
          result.data ? 'Jours fériés fermés.' : 'Jours fériés ouverts selon la semaine type.',
        );
        this._bookingWarning.set(null);
      });
  }

  private replaceDay(answer: CalendarDay): void {
    this._shown.update(
      (month) =>
        month && {
          ...month,
          days: month.days.map((day) => (day.date === answer.date ? answer : day)),
        },
    );
  }

  private warningFor(day: CalendarDay): BookingWarning | null {
    if (day.state !== 'closed' && day.state !== 'holiday') return null;
    const count = this.bookingsByDate().get(day.date) ?? 0;
    return count === 0 ? null : { date: day.date, count };
  }
}
