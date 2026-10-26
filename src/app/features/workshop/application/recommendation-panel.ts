import { Component, input } from '@angular/core';
import type { GuideState } from '../domain/models/recommendation.model';
import { INSERT_GUIDE_COPY } from './insert-guide-copy';

@Component({
  selector: 'app-recommendation-panel',
  host: { class: 'block rounded-card border border-line bg-surface p-5 sm:p-6' },
  template: `
    @switch (state().status) {
      @case ('incomplete') {
        <p data-testid="recommendation-incomplete" class="text-muted">{{ copy.incomplete }}</p>
      }
      @case ('unavailable') {
        <p data-testid="insert-guide-unavailable" class="font-medium">{{ copy.unavailable }}</p>
      }
    }
  `,
})
export class RecommendationPanel {
  readonly state = input.required<GuideState>();

  protected readonly copy = INSERT_GUIDE_COPY;
}
