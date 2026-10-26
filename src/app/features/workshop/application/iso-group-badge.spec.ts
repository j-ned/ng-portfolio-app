import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { settle } from '@shared/testing/settle';
import type { IsoGroupLetter } from '../domain/models/material.model';
import { InsertGuidePage } from '../testing/insert-guide.page-model';
import { IsoGroupBadge } from './iso-group-badge';

describe('IsoGroupBadge', () => {
  it.each<IsoGroupLetter>(['P', 'S'])(
    'Given the group %s When the badge renders Then the letter is said in text, after its label',
    async (letter) => {
      const fixture = TestBed.createComponent(IsoGroupBadge);
      fixture.componentRef.setInput('letter', letter);
      await settle(fixture);
      const page = new InsertGuidePage(fixture);

      expect([
        page.host.textContent?.replace(/\s+/g, ' ').trim(),
        page.text('iso-group-letter'),
      ]).toEqual([`Groupe ISO ${letter}`, letter]);
    },
  );

  it('Given a group When the badge renders Then the letter carries it alone: no inline style and no aria-hidden swatch', async () => {
    const fixture = TestBed.createComponent(IsoGroupBadge);
    fixture.componentRef.setInput('letter', 'K');
    await settle(fixture);
    const host = fixture.nativeElement as HTMLElement;

    expect([
      host.querySelector('[data-testid="iso-group-letter"]')?.textContent?.trim(),
      host.querySelectorAll('[style]').length,
      host.querySelectorAll('[aria-hidden="true"]').length,
    ]).toEqual(['K', 0, 0]);
  });
});
