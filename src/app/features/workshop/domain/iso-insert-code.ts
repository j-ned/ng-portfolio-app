import type { IsoInsertDesignation } from './models/recommendation.model';

export function isoInsertCode(insert: IsoInsertDesignation): string {
  return insert.fields.map(({ value }) => value.code).join('');
}
