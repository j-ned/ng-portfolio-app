import type {
  Designation,
  DesignationSystem,
  IsoGroup,
  IsoGroupColor,
  IsoGroupLetter,
  Material,
} from '../domain/models/material.model';
import type { Source, SourceCitation, SourceId, Sourced } from '../domain/models/source.model';

// Fictional ids stay assignable whatever the real closed unions list.
const FICTIONAL_SOURCE_ID = 'source-fictive' as string as SourceId;
const FICTIONAL_COLOR = 'couleur-fictive' as string as IsoGroupColor;

export function aSource(overrides: Partial<Source> = {}): Source {
  return {
    title: 'Document fictif de test',
    publisher: 'Éditeur fictif',
    url: 'https://exemple.invalid/document-fictif',
    consultedOn: '2001-01-01',
    ...overrides,
  };
}

export function aCitation(overrides: Partial<SourceCitation> = {}): SourceCitation {
  return {
    source: FICTIONAL_SOURCE_ID,
    locator: 'fixture',
    ...overrides,
  };
}

export function aSourced<T>(value: T): Sourced<T> {
  return { value, cite: aCitation() };
}

export function aDesignation(
  value: string,
  system: DesignationSystem = 'common-name',
): Designation {
  return { ...aSourced(value), system };
}

export function aMaterial(overrides: Partial<Material> = {}): Material {
  return {
    slug: 'matiere-fictive',
    designations: [aDesignation('Matière fictive'), aDesignation('ZZ-FICTIF-0', 'en-symbol')],
    isoGroup: aSourced('P'),
    behaviour: [aSourced('Comportement fictif à la coupe.')],
    ...overrides,
  };
}

export function anIsoGroup(letter: IsoGroupLetter, overrides: Partial<IsoGroup> = {}): IsoGroup {
  return {
    letter,
    name: aSourced(`Groupe fictif ${letter}`),
    color: aSourced(FICTIONAL_COLOR),
    ...overrides,
  };
}
