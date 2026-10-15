import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastStore } from '@core/notifications/toast-store';
import { BookingGateway } from '@features/booking/domain/gateways/booking.gateway';
import type { BookingAdminFailure } from '@features/booking/domain/models/booking-admin.model';
import { loadState } from '@shared/ui/load-state';
import { toBookingFeedView } from '../../application/booking-feed-view';

const CREATED = "Lien d'abonnement créé : ajoutez-le à vos agendas.";
const REGENERATED =
  "Nouveau lien créé : l'ancien ne fonctionne plus. Remplacez-le dans vos agendas.";

const CREATION_FAILURES: Partial<Record<BookingAdminFailure, string>> = {
  'not-configured': "Abonnement non configuré : ajoutez BOOKING_FEED_SECRET à l'API.",
  network: 'Création impossible : vérifiez votre connexion, puis réessayez.',
};
const SERVER_FAILURE =
  "Création impossible : le serveur n'a pas répondu. Réessayez dans un instant.";

@Injectable()
export class FeedSubscriptionPanel {
  private readonly gateway = inject(BookingGateway);
  private readonly toast = inject(ToastStore);
  private readonly destroyRef = inject(DestroyRef);

  private readonly subscription = rxResource({
    stream: () => this.gateway.getFeedSubscription(),
  });
  private readonly _regenerating = signal(false);

  readonly view = computed(() =>
    this.subscription.hasValue() ? toBookingFeedView(this.subscription.value()) : null,
  );
  readonly state = computed(() => loadState(this.subscription, () => false));
  readonly regenerating = this._regenerating.asReadonly();

  regenerate(): void {
    if (this._regenerating()) return;
    const created = this.view()?.kind === 'none';
    this._regenerating.set(true);
    this.gateway
      .regenerateFeedSubscription()
      .pipe(
        finalize(() => this._regenerating.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (!result.success) {
          this.toast.add({
            severity: 'error',
            detail: CREATION_FAILURES[result.reason] ?? SERVER_FAILURE,
          });
          if (result.reason === 'not-configured') this.subscription.reload();
          return;
        }
        this.subscription.set(result.data);
        this.toast.add({ severity: 'success', detail: created ? CREATED : REGENERATED });
      });
  }

  reload(): void {
    this.subscription.reload();
  }
}
