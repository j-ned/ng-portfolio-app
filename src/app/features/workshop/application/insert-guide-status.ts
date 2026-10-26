import type { GuideState } from '../domain/models/recommendation.model';
import { INSERT_GUIDE_COPY } from './insert-guide-copy';

export function insertGuideStatus(state: GuideState): string {
  if (state.status !== 'unavailable') return '';
  const { material, operation } = state;
  return `${material.designations[0].value}, ${operation.label}. ${INSERT_GUIDE_COPY.unavailable}`;
}
