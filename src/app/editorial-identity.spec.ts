/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs';
import { HOME_WORK_FRAME } from '@features/home/domain/home-hero.static-data';
import { STATIC_HERO } from '@features/home/infra/data/home.static-data';
import { FORBIDDEN_WORDINGS } from '@shared/identity/forbidden-wordings';
import { SITE_IDENTITY } from '@shared/identity/site-identity.static-data';
import { FOOTER_COPY } from './layout/components/footer/footer.static-data';
import { routes } from './app.routes';
import { EDITORIAL_SOURCES, editorialTexts } from './testing/editorial-sources';

const aboutDescription = (): string =>
  String(routes.find((route) => route.path === 'about')?.data?.['seo']?.description ?? '');

const homeDescription = (): string =>
  String(routes.find((route) => route.path === '')?.data?.['seo']?.description ?? '');

const occurrencesOf = (text: string, part: string): number => text.split(part).length - 1;

const TECHNICAL_VALUE = /^(https?:\/\/|mailto:|tel:|\/)\S*$/u;

const INDEX_HTML = readFileSync('src/index.html', 'utf8');

const IDENTITY_SOURCES: readonly (readonly [string, unknown])[] = [
  ...EDITORIAL_SOURCES,
  ['src/index.html', INDEX_HTML],
];

const FORBIDDEN_IDENTITIES: readonly (readonly [string, RegExp])[] = [
  ...FORBIDDEN_WORDINGS.map(({ label, pattern }) => [`« ${label} »`, pattern] as const),
  ["« aujourd'hui développeur »", /aujourd'hui développeur/iu],
  ["« aujourd'hui tourneur CN en »", /aujourd'hui tourneur CN en/iu],
  ['« Je suis tourneur CN »', /Je suis tourneur CN/iu],
  ['« puis développeur »', /puis développeur/iu],
  ['« 7 jours »', /(?<!\d)7\s+jours\b/u],
  ['« sept jours »', /sept\s+jours/iu],
  ['« jour N »', /\bjours?\s+\d/iu],
  ['« ouvrées »', /ouvrées/iu],
  ['« CDI »', /(?<![\p{L}\p{N}])CDI(?![\p{L}\p{N}])/u],
  ['« recrutez »', /recrutez/iu],
  ['« démarrage sous »', /démarrage\s+sous/iu],
  ['« sur site en »', /sur\s+site\s+en/iu],
  ['« régie »', /(?<!\p{L})r[ée]gie(?!\p{L})/iu],
  ['« temps partiel »', /temps\s+partiel/iu],
  // Spec 029 : fin de l'activité freelance, plus aucune trace commerciale dans les textes du site.
  ['« freelance »', /free-?lance/iu],
  ['« Malt »', /(?<!\p{L})malt(?!\p{L})/iu],
  ['« SIRET »', /(?<!\p{L})sir[ée]n|(?<!\p{L})siret(?!\p{L})/iu],
  ['« devis »', /(?<!\p{L})devis(?!\p{L})/iu],
  ['« missions »', /(?<!\p{L})missions?(?!\p{L})/iu],
  ['« prix annoncé »', /prix\s+annonc/iu],
];

const EVENING_AND_WEEKEND = /le soir et le week-end/iu;

const FORMAL_ADDRESS =
  /(?<![\p{L}\p{N}_])(?<!rendez-)(?:vous|votre|vos|vôtres?|réessayez|vérifiez|patientez|retournez|écrivez|contactez|explorez|sélectionnez)(?![\p{L}\p{N}_])/giu;

const formalAddressIn = (text: string): readonly string[] =>
  text
    .split('\n')
    .flatMap((line, index) =>
      [...line.matchAll(FORMAL_ADDRESS)].map(([word]) => `line ${index + 1}: « ${word} »`),
    );

// Admin and auth address their only user, the owner, who keeps the formal "vous".
const PUBLIC_ROOT = /^(?:pages|layout|shared|features\/(?!admin\/|auth\/)[^/]+)\//u;
const TEMPLATE_FILE = /(?<!\.spec)\.(?:ts|html)$/u;
const TEST_DATA = /(?:^|\/)testing\//u;

const PUBLIC_TEMPLATES: readonly (readonly [string, string])[] = readdirSync('src/app', {
  recursive: true,
  encoding: 'utf8',
})
  .map((path) => path.replaceAll('\\', '/'))
  .filter((path) => PUBLIC_ROOT.test(path) && TEMPLATE_FILE.test(path) && !TEST_DATA.test(path))
  .sort()
  .map((path) => [`src/app/${path}`, readFileSync(`src/app/${path}`, 'utf8')] as const);

describe('one identity across the site', () => {
  it.each([
    ['the home lead', (): string => STATIC_HERO.lead],
    ['the about meta description', aboutDescription],
  ])('%s tells the journey exactly once, in its single wording', (_place, textOf) => {
    expect(occurrencesOf(textOf(), SITE_IDENTITY.journey)).toBe(1);
  });

  describe.each(FORBIDDEN_IDENTITIES)('never publishes %s', (_label, pattern) => {
    it.each(IDENTITY_SOURCES)('in %s', (name, source) => {
      expect(
        editorialTexts(source, name)
          .filter(({ text }) => !TECHNICAL_VALUE.test(text) && pattern.test(text))
          .map(({ path }) => path),
      ).toEqual([]);
    });
  });

  it.each([
    ['the CDI', 'Ouvert au CDI en Île-de-France.'],
    ['the CDI before a comma', 'Poste en CDI, temps plein.'],
  ])('flags a sentence that mentions %s', (_label, sentence) => {
    const cdi = FORBIDDEN_IDENTITIES.find(([label]) => label === '« CDI »')?.[1];
    expect(cdi?.test(sentence)).toBe(true);
  });

  it.each([
    ['a word that only contains the letters', 'Cdi5TzDRplmKECE'],
    ['the CNC machining trade', 'Tourneur CNC en journée.'],
  ])('does not mistake %s for the CDI', (_label, text) => {
    const cdi = FORBIDDEN_IDENTITIES.find(([label]) => label === '« CDI »')?.[1];
    expect(cdi?.test(text)).toBe(false);
  });

  // Spec 029 : plus d'activité commerciale. Le cadre « le soir et le week-end » vendait une
  // disponibilité ; il ne doit plus apparaître sur la home ni dans le pied de page.
  it.each([
    ['the home lead', (): string => STATIC_HERO.lead],
    ['the home meta description', homeDescription],
    [
      'the work frame of the home',
      (): string => HOME_WORK_FRAME.rows.map(({ value }) => value).join(' '),
    ],
    ['the footer tagline', (): string => FOOTER_COPY.tagline],
  ])('%s no longer sells an evening and weekend availability', (_place, textOf) => {
    expect(textOf()).not.toMatch(EVENING_AND_WEEKEND);
  });
});

describe('the public site never says « vous »', () => {
  it.each(IDENTITY_SOURCES)('in %s', (name, source) => {
    expect(
      editorialTexts(source, name).flatMap(({ path, text }) =>
        formalAddressIn(text).map((found) => `${path} ${found}`),
      ),
    ).toEqual([]);
  });

  it.each(PUBLIC_TEMPLATES)('in %s', (_file, text) => {
    expect(formalAddressIn(text)).toEqual([]);
  });

  it.each([
    'src/app/pages/legal-notice.ts',
    'src/app/pages/privacy-policy.ts',
    'src/app/pages/page-not-found.ts',
    'src/app/features/contact/application/contact-form.ts',
    'src/app/features/contact/infra/gateways/http-contact.gateway.ts',
    'src/app/features/blog/pages/blog-list/blog-list.ts',
    'src/app/features/projects/pages/projects/projects.ts',
    'src/app/features/projects/pages/project-detail/project-detail.ts',
    'src/app/layout/components/footer/footer.ts',
    'src/app/shared/ui/load-error.ts',
  ])('reads the template of %s', (file) => {
    expect(PUBLIC_TEMPLATES.map(([path]) => path)).toContain(file);
  });

  it.each([
    ['the admin', 'src/app/features/admin/'],
    ['the authentication', 'src/app/features/auth/'],
    ['the tests', '.spec.ts'],
    ['the test data', '/testing/'],
  ])('leaves %s out', (_label, part) => {
    expect(PUBLIC_TEMPLATES.filter(([path]) => path.includes(part))).toEqual([]);
  });

  it.each([
    ['a pronoun', 'La page que vous cherchez', ['line 1: « vous »']],
    ['a possessive at the start of a sentence', 'Vos droits', ['line 1: « Vos »']],
    ['a capitalised imperative', 'Écrivez-moi.', ['line 1: « Écrivez »']],
    [
      'several words on the second line',
      'Erreur.\nVérifiez votre connexion, puis réessayez.',
      ['line 2: « Vérifiez »', 'line 2: « votre »', 'line 2: « réessayez »'],
    ],
  ])('flags %s', (_label, text, found) => {
    expect(formalAddressIn(text)).toEqual(found);
  });

  it.each([
    ['« chez » and « assez »', 'Hébergé chez moi, assez simple.'],
    ['a word that only starts with the letters', 'Les Vosges, une voûte, un vote.'],
    ['an appointment', 'Prendre rendez-vous.'],
    ['the informal address', 'Vérifie ta connexion, puis réessaie.'],
  ])('does not flag %s', (_label, text) => {
    expect(formalAddressIn(text)).toEqual([]);
  });
});
