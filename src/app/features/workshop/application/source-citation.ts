import { Component, input } from '@angular/core';
import type { Source, SourceCitation as Citation } from '../domain/models/source.model';
import { INSERT_GUIDE_COPY } from './insert-guide-copy';

@Component({
  selector: 'app-source-citation',
  host: { class: 'block text-xs text-muted', 'data-testid': 'source-citation' },
  template: `
    {{ copy.source }}
    <a
      data-testid="source-citation-link"
      [href]="source().url"
      target="_blank"
      rel="noopener noreferrer"
      class="underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >{{ source().title }}<span class="sr-only"> {{ copy.newTab }}</span></a
    >,
    <span data-testid="source-citation-locator">{{ citation().locator }}</span>
  `,
})
export class SourceCitation {
  readonly citation = input.required<Citation>();
  readonly source = input.required<Source>();

  protected readonly copy = INSERT_GUIDE_COPY;
}
