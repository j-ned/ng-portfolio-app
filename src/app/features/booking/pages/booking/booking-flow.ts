import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form } from '@angular/forms/signals';
import { loadState } from '@shared/ui/load-state';
import { BookingGateway } from '../../domain/gateways/booking.gateway';
import { groupDaysByWeek } from '../../domain/group-days-by-week';
import { groupSlotsByDay } from '../../domain/group-slots-by-day';
import type { BookingDay, BookingWeek } from '../../domain/models/booking.model';

type BookingDraft = { readonly startsAt: string };

const isOffered = (days: readonly BookingDay[], startsAt: string): boolean =>
  days.some((day) => day.slots.some((slot) => slot.startsAt === startsAt));

@Injectable()
export class BookingFlow {
  private readonly _gateway = inject(BookingGateway);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Jamais demandés au prérendu : des créneaux sérialisés dans le HTML seraient périmés.
  private readonly _slots = rxResource({
    params: () => (this._isBrowser ? true : undefined),
    stream: () => this._gateway.getSlots(),
  });

  private readonly _days = computed(() =>
    this._slots.hasValue() ? groupSlotsByDay(this._slots.value()) : [],
  );

  private readonly _weekIndex = linkedSignal<readonly BookingWeek[], number>({
    source: () => this.weeks(),
    computation: (weeks, previous) => Math.max(0, Math.min(previous?.value ?? 0, weeks.length - 1)),
  });

  private readonly _selectedDate = linkedSignal<readonly BookingDay[], string | null>({
    source: this._days,
    computation: (days, previous) => {
      const date = previous?.value ?? null;
      return days.some((day) => day.date === date) ? date : null;
    },
  });

  private readonly _model = linkedSignal<readonly BookingDay[], BookingDraft>({
    source: this._days,
    computation: (days, previous) => {
      const draft = previous?.value ?? { startsAt: '' };
      return draft.startsAt === '' || isOffered(days, draft.startsAt)
        ? draft
        : { ...draft, startsAt: '' };
    },
  });

  readonly form = form(this._model);
  readonly state = computed(() => loadState(this._slots, () => this._days().length === 0));
  readonly weeks = computed(() => groupDaysByWeek(this._days()));
  readonly currentWeek = computed(() => this.weeks()[this._weekIndex()] ?? null);
  readonly hasPreviousWeek = computed(() => this._weekIndex() > 0);
  readonly hasNextWeek = computed(() => this._weekIndex() < this.weeks().length - 1);
  readonly selectedDate = this._selectedDate.asReadonly();
  readonly selectedDay = computed(
    () => this._days().find((day) => day.date === this._selectedDate()) ?? null,
  );

  showPreviousWeek(): void {
    if (this.hasPreviousWeek()) this._weekIndex.update((index) => index - 1);
  }

  showNextWeek(): void {
    if (this.hasNextWeek()) this._weekIndex.update((index) => index + 1);
  }

  selectDay(date: string): void {
    this._selectedDate.set(date);
    this._model.update((draft) => ({ ...draft, startsAt: '' }));
  }

  reloadSlots(): void {
    this._slots.reload();
  }
}
