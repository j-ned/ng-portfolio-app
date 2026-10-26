import type { Operation, OperationFamily } from '../domain/models/operation.model';
import type { GuideState } from '../domain/models/recommendation.model';
import { INSERT_GUIDE_COPY } from './insert-guide-copy';

const spokenOperation = (operation: Operation, families: readonly OperationFamily[]): string => {
  const operations = families.flatMap((family) =>
    family.operations.map((candidate) => ({ family, candidate })),
  );
  const shared =
    operations.filter(({ candidate }) => candidate.label === operation.label).length > 1;
  const family = operations.find(({ candidate }) => candidate.id === operation.id)?.family;
  return shared && family ? `${operation.label} (${family.label})` : operation.label;
};

export function insertGuideStatus(state: GuideState, families: readonly OperationFamily[]): string {
  if (state.status !== 'unavailable') return '';
  const { material, operation } = state;
  return `${material.designations[0].value}, ${spokenOperation(operation, families)}. ${INSERT_GUIDE_COPY.unavailable}`;
}
