import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { settle } from '@shared/testing/settle';
import { aCitation, aSource } from '../testing/insert-guide-builders';
import { InsertGuidePage } from '../testing/insert-guide.page-model';
import { SourceCitation } from './source-citation';

describe('SourceCitation', () => {
  async function render(): Promise<InsertGuidePage> {
    const fixture = TestBed.createComponent(SourceCitation);
    fixture.componentRef.setInput('citation', aCitation({ locator: 'Tableau fictif 3' }));
    fixture.componentRef.setInput('source', aSource());
    await settle(fixture);
    return new InsertGuidePage(fixture);
  }

  it('Given a citation When it renders Then it names the source document, then where in it', async () => {
    const page = await render();

    expect([
      page.host.textContent?.replace(/\s+/g, ' ').trim(),
      page.text('source-citation-locator'),
    ]).toEqual([
      'Source : Document fictif de test (nouvel onglet), Tableau fictif 3',
      'Tableau fictif 3',
    ]);
  });

  it('Given a citation When it renders Then the document title links to its URL in a new tab, said to screen readers', async () => {
    const page = await render();
    const link = page.one('source-citation-link');

    expect({
      tag: link?.tagName,
      href: link?.getAttribute('href'),
      target: link?.getAttribute('target'),
      rel: link?.getAttribute('rel'),
      newTab: link?.querySelector('.sr-only')?.textContent?.trim(),
    }).toEqual({
      tag: 'A',
      href: 'https://exemple.invalid/document-fictif',
      target: '_blank',
      rel: 'noopener noreferrer',
      newTab: '(nouvel onglet)',
    });
  });
});
