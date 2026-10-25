import type { Designation, DesignationSystem, Material } from '../domain/models/material.model';
import type { SourceCitation, SourceId, Sourced } from '../domain/models/source.model';

// A fictional source must stay assignable whatever documents the real catalogue lists.
const FICTIONAL_SOURCE_ID = 'source-fictive' as string as SourceId;

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
