import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { settle } from '@shared/testing/settle';
import type { GuideState } from '../domain/models/recommendation.model';
import { aMaterialCatalogue, anOperation } from '../testing/insert-guide-builders';
import { InsertGuidePage } from '../testing/insert-guide.page-model';
import { INSERT_GUIDE_COPY } from './insert-guide-copy';
import { RecommendationPanel } from './recommendation-panel';

const [ALPHA] = aMaterialCatalogue();

async function render(state: GuideState): Promise<InsertGuidePage> {
  TestBed.configureTestingModule({ imports: [RecommendationPanel] });
  const fixture = TestBed.createComponent(RecommendationPanel);
  fixture.componentRef.setInput('state', state);
  await settle(fixture);
  return new InsertGuidePage(fixture);
}

describe('RecommendationPanel', () => {
  it('Given an incomplete selection When the panel renders Then it invites to choose a material and an operation', async () => {
    const page = await render({ status: 'incomplete' });

    expect({
      tag: page.one('recommendation-incomplete')?.tagName,
      incomplete: page.text('recommendation-incomplete'),
      unavailable: page.one('insert-guide-unavailable'),
    }).toEqual({ tag: 'P', incomplete: INSERT_GUIDE_COPY.incomplete, unavailable: null });
  });

  it('Given a combination without recommendation When the panel renders Then it says so plainly and shows nothing else', async () => {
    const page = await render({
      status: 'unavailable',
      material: ALPHA,
      operation: anOperation('external-finishing', { label: 'Finition fictive' }),
    });

    expect({
      tag: page.one('insert-guide-unavailable')?.tagName,
      unavailable: page.text('insert-guide-unavailable'),
      incomplete: page.one('recommendation-incomplete'),
      whole: page.host.textContent?.replace(/[ \t\n\r]+/g, ' ').trim(),
      citations: page.all('source-citation').length,
    }).toEqual({
      tag: 'P',
      unavailable: INSERT_GUIDE_COPY.unavailable,
      incomplete: null,
      whole: INSERT_GUIDE_COPY.unavailable,
      citations: 0,
    });
  });
});
