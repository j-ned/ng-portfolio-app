import { Component } from '@angular/core';
import { INSERT_GUIDE_COPY } from '../../application/insert-guide-copy';

@Component({
  selector: 'app-insert-guide',
  host: { class: 'block min-h-svh pt-20' },
  template: `
    <div class="page-container pt-18 pb-14 md:pt-26 md:pb-18">
      <h1
        data-testid="insert-guide-title"
        class="text-[clamp(2.75rem,6vw,5.25rem)] font-extrabold leading-none tracking-[-0.04em]"
      >
        {{ copy.heading }}
      </h1>
      <p
        data-testid="insert-guide-lead"
        class="mt-5.5 max-w-[56ch] text-[clamp(1.0625rem,1.4vw,1.25rem)] text-muted"
      >
        {{ copy.lead }}
      </p>
      <p data-testid="insert-guide-disclaimer" class="mt-10 max-w-prose text-sm text-muted">
        {{ copy.disclaimer }}
      </p>
      <p role="status" class="sr-only" data-testid="insert-guide-status"></p>
    </div>
  `,
})
export class InsertGuide {
  protected readonly copy = INSERT_GUIDE_COPY;
}
