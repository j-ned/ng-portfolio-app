import { Component, input, output } from '@angular/core';
import { AppIcon } from '@shared/icons/app-icon';
import { Button } from '@shared/ui/button';
import { LoadError } from '@shared/ui/load-error';
import type { LoadState } from '@shared/ui/load-state';
import { AppSkeleton } from '@shared/ui/skeleton';
import type { CalendarMonthView } from '../calendar-month-view';
import { AdminMonthGrid } from './admin-month-grid';
import { AdminSectionHead } from './admin-section-head';

type MonthRequest = { readonly month: string; readonly focusDate: string | null };

@Component({
  selector: 'section[app-admin-availability-calendar]',
  imports: [AppIcon, Button, LoadError, AppSkeleton, AdminMonthGrid, AdminSectionHead],
  host: {
    'data-testid': 'admin-calendar',
    'aria-labelledby': 'admin-calendar-heading',
    class: 'block',
  },
  template: `
    <app-admin-section-head heading="Calendrier" headingId="admin-calendar-heading" />

    @switch (state()) {
      @case ('error') {
        <app-load-error
          message="Le calendrier n'a pas pu être chargé. Vérifiez votre connexion, puis réessayez."
          (retry)="retry.emit()"
        />
      }
      @case ('loading') {
        <div data-testid="admin-calendar-loading" role="status" class="mt-6">
          <span class="sr-only">Chargement du calendrier…</span>
          <app-skeleton class="block h-80 rounded-sm" />
        </div>
      }
      @default {
        @if (view(); as month) {
          <div class="mt-5 flex items-center justify-between gap-3">
            <p
              id="admin-calendar-month-label"
              data-testid="admin-calendar-month-label"
              aria-live="polite"
              class="font-display text-lg font-bold font-stretch-106%"
            >
              {{ month.label }}
            </p>
            <div class="flex gap-2">
              <button
                appButton
                variant="outlined"
                type="button"
                data-testid="admin-calendar-previous"
                class="min-w-11 justify-center px-3 aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
                [attr.aria-disabled]="month.previousMonth ? null : 'true'"
                (click)="showMonth(month.previousMonth)"
              >
                <app-icon name="chevron-left" [size]="14" />
                <span class="max-sm:sr-only">Mois précédent</span>
              </button>
              <button
                appButton
                variant="outlined"
                type="button"
                data-testid="admin-calendar-next"
                class="min-w-11 justify-center px-3 aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
                [attr.aria-disabled]="month.nextMonth ? null : 'true'"
                (click)="showMonth(month.nextMonth)"
              >
                <span class="max-sm:sr-only">Mois suivant</span>
                <app-icon name="chevron-right" [size]="14" />
              </button>
            </div>
          </div>

          <app-admin-month-grid
            class="mt-4"
            [view]="month"
            [focusDate]="focusDate()"
            [busy]="busy()"
            (monthRequested)="monthRequested.emit($event)"
          />

          <p
            id="admin-calendar-help"
            data-testid="admin-calendar-help"
            class="mt-3 text-sm text-muted"
          >
            Cliquez un jour, ou Entrée et Espace, pour le fermer ou le rouvrir. Flèches : jour
            voisin ; Page précédente et Page suivante : mois voisin.
          </p>

          <ul
            role="list"
            data-testid="admin-calendar-legend"
            class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm"
          >
            <li
              data-testid="admin-calendar-legend-item"
              data-state="open"
              class="flex items-center gap-2"
            >
              <span
                aria-hidden="true"
                class="inline-flex size-6 items-center justify-center rounded-sm bg-primary/10 font-mono text-xs font-semibold text-primary"
                >4</span
              >
              Ouvert (créneaux)
            </li>
            <li
              data-testid="admin-calendar-legend-item"
              data-state="empty"
              class="flex items-center gap-2"
            >
              <span
                aria-hidden="true"
                class="inline-flex size-6 items-center justify-center rounded-sm text-muted"
                >—</span
              >
              Aucun créneau
            </li>
            <li
              data-testid="admin-calendar-legend-item"
              data-state="closed"
              class="flex items-center gap-2"
            >
              <span
                class="inline-flex size-6 items-center justify-center rounded-sm border border-dashed border-field bg-foreground/8 text-foreground"
              >
                <app-icon name="lock" [size]="12" />
              </span>
              Fermé
            </li>
            <li
              data-testid="admin-calendar-legend-item"
              data-state="holiday"
              class="flex items-center gap-2"
            >
              <span class="inline-flex size-6 items-center justify-center rounded-sm text-muted">
                <app-icon name="flag" [size]="12" />
              </span>
              Férié
            </li>
            <li
              data-testid="admin-calendar-legend-item"
              data-state="closed-period"
              class="flex items-center gap-2"
            >
              <span
                class="inline-flex size-6 items-center justify-center rounded-sm bg-status-warn/10 text-status-warn"
              >
                <app-icon name="calendar" [size]="12" />
              </span>
              Période
            </li>
            <li
              data-testid="admin-calendar-legend-item"
              data-state="past"
              class="flex items-center gap-2"
            >
              <span
                class="relative inline-flex size-6 rounded-sm before:absolute before:inset-x-1 before:top-1/2 before:h-0.5 before:-translate-y-1/2 before:bg-status-error"
              ></span>
              Passé
            </li>
          </ul>
        }
      }
    }
  `,
})
export class AdminAvailabilityCalendar {
  readonly view = input.required<CalendarMonthView | null>();
  readonly state = input.required<LoadState>();
  readonly busy = input(false);
  readonly focusDate = input<string | null>(null);
  readonly monthRequested = output<MonthRequest>();
  readonly retry = output<void>();

  protected showMonth(month: string | null): void {
    if (month !== null) this.monthRequested.emit({ month, focusDate: null });
  }
}
