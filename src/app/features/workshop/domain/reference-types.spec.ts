import { describe, expectTypeOf, it } from 'vitest';
import {
  aCitation,
  aDesignation,
  aMaterial,
  anIsoGroup,
  aSource,
  aSourced,
} from '../testing/insert-guide-builders';
import type { IsoGroup, Material } from './models/material.model';
import type { Source, SourceCitation, SourceId, Sourced } from './models/source.model';
import { SOURCES } from './sources.static-data';

describe('Source types', () => {
  it('Given the catalogue When its type is read Then every source id needs its entry', () => {
    expectTypeOf(SOURCES).toEqualTypeOf<Readonly<Record<SourceId, Source>>>();
  });

  it('Given a sourced value When the citation is missing Then it does not compile', () => {
    // @ts-expect-error: a displayed value always carries its citation
    const _refused: Sourced<string> = { value: 'Texte fictif' };
  });

  it('Given a citation When its source is outside the catalogue Then it does not compile', () => {
    // @ts-expect-error: a citation only points to a catalogued source
    const _refused = aCitation({ source: 'source-hors-catalogue' });
  });

  it('Given a citation When the locator is missing Then it does not compile', () => {
    // @ts-expect-error: a citation says where in the source the value is found
    const _refused: SourceCitation = { source: aCitation().source };
  });

  it('Given a source When its URL is not https Then it does not compile', () => {
    // @ts-expect-error: a source URL is always https
    const _refused: Source = { ...aSource(), url: 'http://exemple.invalid/document-fictif' };
  });

  it('Given a source When the consultation date is missing Then it does not compile', () => {
    const { consultedOn: _dropped, ...undated } = aSource();
    // @ts-expect-error: a source records when it was consulted
    const _refused: Source = undated;
  });

  it('Given a source When the publisher is missing Then it does not compile', () => {
    const { publisher: _dropped, ...anonymous } = aSource();
    // @ts-expect-error: a source names its publisher
    const _refused: Source = anonymous;
  });
});

describe('ISO group types', () => {
  it('Given an ISO group When its letter is outside the six groups Then it does not compile', () => {
    // @ts-expect-error: ISO 513 only defines P, M, K, N, S and H
    const _refused: IsoGroup = { ...anIsoGroup('P'), letter: 'X' };
  });

  it('Given an ISO group When its name is not sourced Then it does not compile', () => {
    // @ts-expect-error: the group name comes from a cited source
    const _refused: IsoGroup = { ...anIsoGroup('M'), name: 'Groupe fictif' };
  });

  it('Given an ISO group When its colour is outside the closed union Then it does not compile', () => {
    // @ts-expect-error: only the colours the standard assigns are accepted
    const _refused: IsoGroup = { ...anIsoGroup('K'), color: aSourced('couleur-hors-norme') };
  });

  it('Given an ISO group When its colour is not sourced Then it does not compile', () => {
    // @ts-expect-error: the group colour comes from a cited source
    const _refused: IsoGroup = { ...anIsoGroup('N'), color: 'couleur-fictive' };
  });
});

describe('Material types', () => {
  it('Given a material When it has no designation Then it does not compile', () => {
    // @ts-expect-error: a material is displayed under at least one designation
    const _refused: Material = aMaterial({ designations: [] });
  });

  it('Given a material When it has no cutting behaviour Then it does not compile', () => {
    // @ts-expect-error: a material always describes how it cuts
    const _refused: Material = aMaterial({ behaviour: [] });
  });

  it('Given a material When its ISO group is outside the six letters Then it does not compile', () => {
    // @ts-expect-error: the ISO group is one of the six letters
    const _refused: Material = aMaterial({ isoGroup: aSourced('X') });
  });

  it('Given a material When its ISO group is not sourced Then it does not compile', () => {
    // @ts-expect-error: the ISO group comes from a cited source
    const _refused: Material = aMaterial({ isoGroup: 'P' });
  });

  it('Given a material When a designation is not sourced Then it does not compile', () => {
    const unsourced = { value: 'ZZ-FICTIF-9', system: 'aisi' } as const;
    // @ts-expect-error: every designation comes from a cited source
    const _refused: Material = aMaterial({ designations: [unsourced] });
  });

  it('Given a designation When its system is unknown Then it does not compile', () => {
    // @ts-expect-error: the designation systems form a closed list
    const _refused = aDesignation('ZZ-FICTIF-9', 'systeme-inconnu');
  });

  it('Given a material When a behaviour line is not sourced Then it does not compile', () => {
    // @ts-expect-error: every behaviour line comes from a cited source
    const _refused: Material = aMaterial({ behaviour: ['Comportement fictif.'] });
  });
});
