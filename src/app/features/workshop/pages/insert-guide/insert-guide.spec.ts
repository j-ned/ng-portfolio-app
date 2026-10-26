import { TestBed } from '@angular/core/testing';
import { INSERT_GUIDE_COPY } from '../../application/insert-guide-copy';
import { InsertGuide } from './insert-guide';

const collapsed = (element: Element | null): string =>
  (element?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim();

const renderInsertGuide = async (): Promise<HTMLElement> => {
  const fixture = TestBed.createComponent(InsertGuide);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
};

describe('InsertGuide', () => {
  it('Given the guide copy When the page is rendered Then its single h1 is the guide heading', async () => {
    const host = await renderInsertGuide();

    expect(host.querySelectorAll('h1')).toHaveLength(1);
    expect(host.querySelector('h1')?.getAttribute('data-testid')).toBe('insert-guide-title');
    expect(collapsed(host.querySelector('[data-testid="insert-guide-title"]'))).toBe(
      INSERT_GUIDE_COPY.heading,
    );
  });

  it('Given the guide copy When the page is rendered Then the lead paragraph introduces the guide', async () => {
    const lead = (await renderInsertGuide()).querySelector('[data-testid="insert-guide-lead"]');

    expect([lead?.tagName, collapsed(lead)]).toEqual(['P', INSERT_GUIDE_COPY.lead]);
  });

  it('Given the guide copy When the page is rendered Then the disclaimer is always shown', async () => {
    const disclaimer = (await renderInsertGuide()).querySelector(
      '[data-testid="insert-guide-disclaimer"]',
    );

    expect([disclaimer?.tagName, collapsed(disclaimer)]).toEqual([
      'P',
      INSERT_GUIDE_COPY.disclaimer,
    ]);
  });

  it('Given nothing is chosen yet When the page is rendered Then the live status region exists and is empty', async () => {
    const status = (await renderInsertGuide()).querySelector('[data-testid="insert-guide-status"]');

    expect([status?.getAttribute('role'), collapsed(status)]).toEqual(['status', '']);
  });

  it('Given the shell owns the landmarks When the page is rendered Then it emits no main, header nor footer and lays itself out on the host', async () => {
    const host = await renderInsertGuide();

    expect(host.querySelectorAll('main, header, footer')).toHaveLength(0);
    expect([...host.classList].sort()).toEqual(['block', 'min-h-svh', 'pt-20']);
  });
});
