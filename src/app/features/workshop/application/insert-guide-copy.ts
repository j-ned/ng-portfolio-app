export const INSERT_GUIDE_COPY = {
  heading: 'Guide des plaquettes',
  lead: "Choisis ta matière et ton opération : le guide t'indique le type de plaquette à prendre.",
  disclaimer:
    'Recommandation indicative : elle ne remplace ni le catalogue de ton outil ni ton expérience.',
  materialHeading: 'La matière',
  materialLabel: 'Matière',
  materialHint:
    'Tape une désignation : EN, numéro matière, AISI, UNS, ancienne AFNOR ou nom courant.',
  materialListLabel: 'Matières suggérées',
  materialFound: 'matière trouvée',
  materialsFound: 'matières trouvées',
  noMaterialFound: 'Aucune matière trouvée',
  materialNotInGuide: "Cette matière n'est pas encore dans le guide.",
  isoGroup: 'Groupe ISO',
  source: 'Source :',
  newTab: '(nouvel onglet)',
  designationSystems: {
    'en-symbol': 'Symbole EN',
    'material-number': 'Numéro matière',
    aisi: 'AISI',
    uns: 'UNS',
    'afnor-legacy': 'Ancienne AFNOR',
    'common-name': 'Nom courant',
  },
} as const;
