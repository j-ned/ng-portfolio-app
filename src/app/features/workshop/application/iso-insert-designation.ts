import { Component, computed, input } from '@angular/core';
import { isoInsertCode } from '../domain/iso-insert-code';
import type { IsoInsertDesignation as Designation } from '../domain/models/recommendation.model';
import type { Source, SourceId } from '../domain/models/source.model';
import { SourceCitation } from './source-citation';

@Component({
  selector: 'app-iso-insert-designation',
  imports: [SourceCitation],
  host: { class: 'block' },
  template: `
    @let catalogue = sources();
    <p data-testid="iso-insert-code" class="font-mono text-3xl font-bold tracking-wider">
      {{ code() }}
    </p>
    <dl class="mt-4 grid gap-3">
      @for (field of insert().fields; track $index) {
        <div data-testid="iso-insert-field" class="grid grid-cols-[3rem_1fr] gap-x-3">
          <dt data-testid="iso-insert-field-name" class="col-span-2 text-sm text-muted">
            {{ field.value.field }}
          </dt>
          <dd data-testid="iso-insert-field-code" class="font-mono text-lg font-semibold">
            {{ field.value.code }}
          </dd>
          <dd>
            <span data-testid="iso-insert-field-meaning">{{ field.value.meaning }}</span>
            <app-source-citation [citation]="field.cite" [source]="catalogue[field.cite.source]" />
          </dd>
        </div>
      }
    </dl>
  `,
})
export class IsoInsertDesignation {
  readonly insert = input.required<Designation>();
  readonly sources = input.required<Readonly<Record<SourceId, Source>>>();

  protected readonly code = computed(() => isoInsertCode(this.insert()));
}
