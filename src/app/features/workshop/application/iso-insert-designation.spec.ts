import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { settle } from '@shared/testing/settle';
import type { IsoInsertDesignation as Designation } from '../domain/models/recommendation.model';
import { aCitation, anIsoInsertField, aReference } from '../testing/insert-guide-builders';
import { InsertGuidePage } from '../testing/insert-guide.page-model';
import { IsoInsertDesignation } from './iso-insert-designation';

const FICTIONAL_INSERT: Designation = {
  kind: 'iso-1832',
  fields: [
    anIsoInsertField('Forme fictive', 'Z', 'Losange fictif'),
    anIsoInsertField('Dépouille fictive', 'Q', 'Angle fictif', aCitation({ basis: 'deduced' })),
    anIsoInsertField('Tolérance fictive', 'X', 'Classe fictive'),
  ],
};

async function render(): Promise<InsertGuidePage> {
  const fixture = TestBed.createComponent(IsoInsertDesignation);
  fixture.componentRef.setInput('insert', FICTIONAL_INSERT);
  fixture.componentRef.setInput('sources', aReference().sources);
  await settle(fixture);
  return new InsertGuidePage(fixture);
}

describe('IsoInsertDesignation', () => {
  it('Given an ISO designation When it renders Then the whole code comes first, its fields joined in order', async () => {
    const page = await render();
    const code = page.one('iso-insert-code');

    expect({
      code: page.text('iso-insert-code'),
      first: page.host.firstElementChild === code,
    }).toEqual({ code: 'ZQX', first: true });
  });

  it('Given an ISO designation When it renders Then each field is read in a dl, in order, with its code, its meaning and its own citation', async () => {
    const page = await render();
    const rows = page.all('iso-insert-field');

    expect({
      list: rows[0]?.parentElement?.tagName,
      rows: rows.map((row) => ({
        field: page.texts('iso-insert-field-name', row),
        term: row.querySelector('[data-testid="iso-insert-field-name"]')?.tagName,
        code: page.texts('iso-insert-field-code', row),
        meaning: page.texts('iso-insert-field-meaning', row),
        citations: page.all('source-citation', row).length,
      })),
    }).toEqual({
      list: 'DL',
      rows: [
        {
          field: ['Forme fictive'],
          term: 'DT',
          code: ['Z'],
          meaning: ['Losange fictif'],
          citations: 1,
        },
        {
          field: ['Dépouille fictive'],
          term: 'DT',
          code: ['Q'],
          meaning: ['Angle fictif'],
          citations: 1,
        },
        {
          field: ['Tolérance fictive'],
          term: 'DT',
          code: ['X'],
          meaning: ['Classe fictive'],
          citations: 1,
        },
      ],
    });
  });

  it('Given a field deduced from the maker principles When the designation renders Then only that field says it is deduced', async () => {
    const page = await render();

    expect(
      page.all('iso-insert-field').map((row) => page.texts('source-citation-mention', row)),
    ).toEqual([[], ['déduit des principes du fabricant'], []]);
  });
});
