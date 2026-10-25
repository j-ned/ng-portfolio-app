export type SourceId = never;

export type SourceCitation = { readonly source: SourceId; readonly locator: string };

export type Sourced<T> = { readonly value: T; readonly cite: SourceCitation };
