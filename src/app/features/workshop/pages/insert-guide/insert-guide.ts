import { Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { INSERT_GUIDE_COPY } from '../../application/insert-guide-copy';
import { INSERT_GUIDE_REFERENCE } from '../../application/insert-guide-reference';
import { MaterialCombobox } from '../../application/material-combobox';
import { MaterialSheet } from '../../application/material-sheet';
import { parseGuideSelection } from '../../domain/guide-selection';

@Component({
  selector: 'app-insert-guide',
  imports: [FormField, MaterialCombobox, MaterialSheet],
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
      <section
        data-testid="insert-guide-material"
        aria-labelledby="insert-guide-material-heading"
        class="mt-12 max-w-2xl"
      >
        <h2 id="insert-guide-material-heading" class="section-title mb-6">
          {{ copy.materialHeading }}
        </h2>
        <app-material-combobox [materials]="reference.materials" [formField]="guideForm.material" />
        @if (material(); as chosen) {
          <app-material-sheet [material]="chosen" [sources]="reference.sources" />
        }
      </section>
      <p data-testid="insert-guide-disclaimer" class="mt-10 max-w-prose text-sm text-muted">
        {{ copy.disclaimer }}
      </p>
      <p role="status" class="sr-only" data-testid="insert-guide-status"></p>
    </div>
  `,
})
export class InsertGuide {
  private readonly _router = inject(Router);
  protected readonly reference = inject(INSERT_GUIDE_REFERENCE);

  // eslint-disable-next-line @angular-eslint/no-input-rename -- le nom public est la clé figée des URL partagées (?matiere=), le code reste en anglais
  readonly materialParam = input<string | undefined>(undefined, { alias: 'matiere' });

  protected readonly copy = INSERT_GUIDE_COPY;

  private readonly _fromUrl = computed(() =>
    parseGuideSelection(this.reference, this.materialParam(), undefined),
  );
  private readonly _selection = linkedSignal(() => this._fromUrl());
  protected readonly guideForm = form(this._selection);
  protected readonly material = computed(() =>
    this.reference.materials.find(({ slug }) => slug === this._selection().material),
  );

  // Ne navigue que sur un choix de l'utilisateur : au rendu serveur et au retour arrière, le modèle vient de l'URL.
  private readonly _reflectSelectionInUrl = effect(() => {
    const { material } = this._selection();
    if (material === this._fromUrl().material) return;
    void this._router.navigate([], {
      queryParams: { matiere: material === '' ? null : material },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });
}
