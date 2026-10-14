import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { BookingGateway } from '@features/booking/domain/gateways/booking.gateway';
import { tap } from 'rxjs';
import type { CalendarMonth } from '@features/booking/domain/models/booking-admin.model';
import type { LoadState } from '@shared/ui/load-state';
import { toCalendarMonthView } from '../../application/calendar-month-view';

@Injectable()
export class AvailabilityCalendar {
  private readonly gateway = inject(BookingGateway);

  private readonly _month = signal<string | null>(null);
  private readonly _focusDate = signal<string | null>(null);
  // Écrit à chaque réponse plutôt que dérivé de la ressource : changer de mois vide sa valeur, et un
  // `linkedSignal` jamais lu avant ce changement n'aurait aucun mois précédent à garder.
  private readonly _shown = signal<CalendarMonth | null>(null);

  private readonly monthResource = rxResource({
    params: () => ({ month: this._month() }),
    stream: ({ params }) =>
      this.gateway
        .getAvailabilityCalendar(params.month)
        .pipe(tap((month) => this._shown.set(month))),
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

  goToMonth(month: string, focusDate: string | null): void {
    this._focusDate.set(focusDate);
    this._month.set(month);
  }

  reload(): void {
    this.monthResource.reload();
  }
}
