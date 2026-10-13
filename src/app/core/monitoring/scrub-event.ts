import type { Breadcrumb, BrowserOptions, ErrorEvent } from '@sentry/angular';

type EventRequest = NonNullable<ErrorEvent['request']>;
type StreamedSpan = Parameters<NonNullable<BrowserOptions['beforeSendSpan']>>[0];

const FILTERED = '[Filtered]';
const FILTERED_BODY_KEYS = ['password', 'newPassword', 'currentPassword', 'code', 'token', 'email'];
const DROPPED_HEADERS = ['authorization', 'cookie'];

const withoutQueryAndFragment = (url: string): string => url.split(/[?#]/, 1)[0];

const withoutSensitiveHeaders = (headers: EventRequest['headers']): EventRequest['headers'] =>
  headers &&
  Object.fromEntries(
    Object.entries(headers).filter(([name]) => !DROPPED_HEADERS.includes(name.toLowerCase())),
  );

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const withFilteredBody = (data: unknown): unknown =>
  isRecord(data)
    ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          FILTERED_BODY_KEYS.includes(key) ? FILTERED : value,
        ]),
      )
    : data;

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (!event.request) return event;
  const { cookies: _cookies, url, headers, data, ...request } = event.request;
  return {
    ...event,
    request: {
      ...request,
      ...(url !== undefined && { url: withoutQueryAndFragment(url) }),
      ...(headers !== undefined && { headers: withoutSensitiveHeaders(headers) }),
      ...(data !== undefined && { data: withFilteredBody(data) }),
    },
  };
}

const BREADCRUMB_URL_KEYS: Readonly<Record<string, readonly string[]>> = {
  fetch: ['url'],
  xhr: ['url'],
  navigation: ['from', 'to'],
};

export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  const urlKeys = BREADCRUMB_URL_KEYS[breadcrumb.category ?? ''];
  const { data } = breadcrumb;
  if (!urlKeys || !data) return breadcrumb;
  return {
    ...breadcrumb,
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        urlKeys.includes(key) && typeof value === 'string' ? withoutQueryAndFragment(value) : value,
      ]),
    ),
  };
}

const SPAN_URL_KEYS = ['url.full', 'http.url'];
const DROPPED_SPAN_KEYS = ['url.query', 'url.fragment'];

export function scrubSpan(span: StreamedSpan): StreamedSpan {
  return {
    ...span,
    attributes: Object.fromEntries(
      Object.entries(span.attributes)
        .filter(([key]) => !DROPPED_SPAN_KEYS.includes(key))
        .map(([key, value]) => [
          key,
          SPAN_URL_KEYS.includes(key) && typeof value === 'string'
            ? withoutQueryAndFragment(value)
            : value,
        ]),
    ),
  };
}
