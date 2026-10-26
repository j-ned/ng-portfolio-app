import { describe, expect, it } from 'vitest';
import { INSERT_GUIDE_COPY } from './insert-guide-copy';

describe('INSERT_GUIDE_COPY', () => {
  it('Given the guide copy When it is read Then the heading, the lead and the disclaimer are the validated texts', () => {
    expect(INSERT_GUIDE_COPY).toEqual({
      heading: 'Guide des plaquettes',
      lead: "Choisis ta matière et ton opération : le guide t'indique le type de plaquette à prendre.",
      disclaimer:
        'Recommandation indicative : elle ne remplace ni le catalogue de ton outil ni ton expérience.',
    });
  });
});
