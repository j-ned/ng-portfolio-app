import type {
  Designation,
  DesignationSystem,
  IsoGroupLetter,
  Material,
} from './models/material.model';
import type { Sourced } from './models/source.model';

type Row = { readonly page: number; readonly group: IsoGroupLetter; readonly line: string };

const listed =
  ({ page, group, line }: Row) =>
  (system: DesignationSystem, value: string): Designation => ({
    value,
    system,
    cite: {
      source: 'julien-working-list',
      locator: `page ${page}, ISO ${group}, ligne «\u00a0${line}\u00a0»`,
      basis: 'stated',
    },
  });

const inGroup = (letter: IsoGroupLetter, subgroup?: string): Sourced<IsoGroupLetter> => ({
  value: letter,
  cite: {
    source: 'sandvik-workpiece-materials',
    locator: `section «\u00a0Groupes de matières usinées\u00a0», ISO ${letter}${subgroup === undefined ? '' : `, ${subgroup}`}`,
    basis: 'stated',
  },
});

const groupAdvice = (letter: IsoGroupLetter, value: string): Sourced<string> => ({
  value,
  cite: {
    source: 'sandvik-workpiece-materials',
    locator: `section «\u00a0Groupes de matières usinées\u00a0», ISO ${letter}`,
    basis: 'stated',
    scope: 'group',
  },
});

const STEEL_BEHAVIOUR: Material['behaviour'] = [
  groupAdvice(
    'P',
    'Usinabilité en général bonne, mais elle varie beaucoup avec la dureté et la teneur en carbone.',
  ),
  groupAdvice('P', "L'acier bas carbone donne un copeau long et collant."),
];

const STAINLESS_BEHAVIOUR: Material['behaviour'] = [
  groupAdvice(
    'M',
    "Écrouissage, arête rapportée et chaleur\u00a0: l'usure en entaille est marquée.",
  ),
  groupAdvice(
    'M',
    'Les ferritiques et les martensitiques se coupent plus facilement que les austénitiques et les duplex.',
  ),
];

const CAST_IRON_BEHAVIOUR: Material['behaviour'] = [
  groupAdvice('K', 'Copeau court et usinabilité en général bonne.'),
  groupAdvice('K', 'La fonte grise est la plus facile, la nodulaire plus exigeante.'),
];

const NON_FERROUS_BEHAVIOUR: Material['behaviour'] = [
  groupAdvice(
    'N',
    'Métal tendre à copeau long, souvent facile à usiner, qui réussit avec des arêtes vives.',
  ),
  groupAdvice('N', 'Un aluminium riche en silicium devient très abrasif.'),
];

const SUPERALLOY_BEHAVIOUR: Material['behaviour'] = [
  groupAdvice(
    'S',
    'Le groupe le plus difficile\u00a0: efforts de coupe élevés, chaleur, écrouissage et copeau dur à maîtriser.',
  ),
  groupAdvice('S', "Le titane conduit mal la chaleur et peut réagir avec l'outil."),
];

const HARD_BEHAVIOUR: Material['behaviour'] = [
  groupAdvice('H', 'Le plus petit groupe, surtout usiné en finition.'),
  groupAdvice('H', 'Efforts de coupe et chaleur élevés.'),
];

const FREE_CUTTING = listed({ page: 1, group: 'P', line: 'Décolletage' });
const STRUCTURAL = listed({ page: 1, group: 'P', line: 'Construction' });
const MEDIUM_CARBON = listed({ page: 1, group: 'P', line: 'Mi-durs au carbone' });
const CR_MO = listed({ page: 1, group: 'P', line: 'Alliés Cr-Mo' });
const CASE_HARDENING = listed({ page: 1, group: 'P', line: 'Cémentation' });
const BEARING = listed({ page: 1, group: 'P', line: 'Roulement & Outils' });
const AUSTENITIC_FREE_CUTTING = listed({ page: 2, group: 'M', line: 'Austénitique (Décolletage)' });
const AUSTENITIC_STANDARD = listed({ page: 2, group: 'M', line: 'Austénitique (Standard)' });
const AUSTENITIC_MOLYBDENUM = listed({ page: 2, group: 'M', line: 'Austénitique (Molybdène)' });
const MARTENSITIC = listed({ page: 2, group: 'M', line: 'Martensitique' });
const PRECIPITATION = listed({ page: 2, group: 'M', line: 'Précipitation (PH)' });
const DUPLEX = listed({ page: 2, group: 'M', line: 'Duplex (Austéno-ferritique)' });
const ALU_COPPER = listed({ page: 2, group: 'N', line: 'Alu Cuivre (2000)' });
const ALU_FREE_CUTTING = listed({ page: 2, group: 'N', line: 'Alu Décolletage' });
const PURE_TITANIUM = listed({ page: 3, group: 'S', line: 'Titane pur' });
const ALPHA_BETA_TITANIUM = listed({ page: 3, group: 'S', line: 'Titane Alpha-Bêta' });
const NICKEL_PH = listed({ page: 3, group: 'S', line: 'Base Nickel (PH)' });
const NICKEL_SOLUTION = listed({ page: 3, group: 'S', line: 'Base Nickel (Sol.)' });
const COBALT = listed({ page: 3, group: 'S', line: 'Base Cobalt' });
const GREY_IRON = listed({ page: 3, group: 'K', line: 'EN-GJL-250 (GG25)' });
const DUCTILE_IRON = listed({ page: 3, group: 'K', line: 'EN-GJS-400-15 / 500-7' });
const HARDENED_BEARING = listed({ page: 3, group: 'H', line: '100Cr6 / 16MnCr5 trempé' });
const COLD_WORK_TOOL = listed({ page: 3, group: 'H', line: 'X153CrMoV12' });

export const MATERIALS: readonly Material[] = [
  {
    slug: '11smn30',
    designations: [
      FREE_CUTTING('en-symbol', '11SMn30'),
      FREE_CUTTING('material-number', '1.0715'),
      FREE_CUTTING('aisi', '1215'),
      FREE_CUTTING('afnor-legacy', 'S250'),
    ],
    isoGroup: inGroup('P', 'non alliés'),
    behaviour: STEEL_BEHAVIOUR,
  },
  {
    slug: '11smnpb30',
    designations: [
      FREE_CUTTING('en-symbol', '11SMnPb30'),
      FREE_CUTTING('material-number', '1.0718'),
      FREE_CUTTING('aisi', '12L14'),
      FREE_CUTTING('afnor-legacy', 'S250Pb'),
    ],
    isoGroup: inGroup('P', 'non alliés'),
    behaviour: STEEL_BEHAVIOUR,
  },
  {
    slug: 's235jr',
    designations: [
      STRUCTURAL('en-symbol', 'S235JR'),
      STRUCTURAL('material-number', '1.0038'),
      STRUCTURAL('aisi', 'A36'),
      STRUCTURAL('afnor-legacy', 'E24'),
    ],
    isoGroup: inGroup('P', 'non alliés'),
    behaviour: STEEL_BEHAVIOUR,
  },
  {
    slug: 's355j2',
    designations: [
      STRUCTURAL('en-symbol', 'S355J2'),
      STRUCTURAL('material-number', '1.0577'),
      STRUCTURAL('aisi', 'A572 Gr.50'),
      STRUCTURAL('afnor-legacy', 'E36'),
    ],
    isoGroup: inGroup('P', 'non alliés'),
    behaviour: STEEL_BEHAVIOUR,
  },
  {
    slug: 'c45',
    designations: [
      MEDIUM_CARBON('en-symbol', 'C45'),
      MEDIUM_CARBON('material-number', '1.0503'),
      MEDIUM_CARBON('aisi', '1045'),
      MEDIUM_CARBON('afnor-legacy', 'XC48'),
      MEDIUM_CARBON('afnor-legacy', 'XC45'),
    ],
    isoGroup: inGroup('P', 'non alliés'),
    behaviour: STEEL_BEHAVIOUR,
  },
  {
    slug: '42crmo4',
    designations: [
      CR_MO('en-symbol', '42CrMo4'),
      CR_MO('material-number', '1.7225'),
      CR_MO('aisi', '4140'),
      CR_MO('afnor-legacy', '42CD4'),
    ],
    isoGroup: inGroup('P', 'faiblement alliés'),
    behaviour: STEEL_BEHAVIOUR,
  },
  {
    slug: '16mncr5',
    designations: [
      CASE_HARDENING('en-symbol', '16MnCr5'),
      CASE_HARDENING('material-number', '1.7131'),
      CASE_HARDENING('aisi', '5115'),
      CASE_HARDENING('afnor-legacy', '16MC5'),
    ],
    isoGroup: inGroup('P', 'faiblement alliés'),
    behaviour: STEEL_BEHAVIOUR,
  },
  {
    slug: '20nicrmo2-2',
    designations: [
      CASE_HARDENING('en-symbol', '20NiCrMo2-2'),
      CASE_HARDENING('material-number', '1.6523'),
      CASE_HARDENING('aisi', '8620'),
      CASE_HARDENING('afnor-legacy', '20NCD2'),
    ],
    isoGroup: inGroup('P', 'faiblement alliés'),
    behaviour: STEEL_BEHAVIOUR,
  },
  {
    slug: '100cr6',
    designations: [
      BEARING('en-symbol', '100Cr6'),
      BEARING('material-number', '1.3505'),
      BEARING('aisi', '52100'),
      BEARING('afnor-legacy', '100C6'),
    ],
    isoGroup: inGroup('P', 'faiblement alliés'),
    behaviour: STEEL_BEHAVIOUR,
  },
  {
    slug: 'x8crnis18-9',
    designations: [
      AUSTENITIC_FREE_CUTTING('en-symbol', 'X8CrNiS18-9'),
      AUSTENITIC_FREE_CUTTING('material-number', '1.4305'),
      AUSTENITIC_FREE_CUTTING('aisi', '303'),
      AUSTENITIC_FREE_CUTTING('afnor-legacy', 'Z8CNF18-09'),
    ],
    isoGroup: inGroup('M', 'austénitiques'),
    behaviour: STAINLESS_BEHAVIOUR,
  },
  {
    slug: 'x5crni18-10',
    designations: [
      AUSTENITIC_STANDARD('en-symbol', 'X5CrNi18-10'),
      AUSTENITIC_STANDARD('material-number', '1.4301'),
      AUSTENITIC_STANDARD('aisi', '304'),
      AUSTENITIC_STANDARD('afnor-legacy', 'Z7CN18-09'),
    ],
    isoGroup: inGroup('M', 'austénitiques'),
    behaviour: STAINLESS_BEHAVIOUR,
  },
  {
    slug: 'x2crni18-9',
    designations: [
      AUSTENITIC_STANDARD('en-symbol', 'X2CrNi18-9'),
      AUSTENITIC_STANDARD('material-number', '1.4307'),
      AUSTENITIC_STANDARD('aisi', '304L'),
      AUSTENITIC_STANDARD('afnor-legacy', 'Z3CN18-10'),
    ],
    isoGroup: inGroup('M', 'austénitiques'),
    behaviour: STAINLESS_BEHAVIOUR,
  },
  {
    slug: 'x2crnimo17-12-2',
    designations: [
      AUSTENITIC_MOLYBDENUM('en-symbol', 'X2CrNiMo17-12-2'),
      AUSTENITIC_MOLYBDENUM('material-number', '1.4404'),
      AUSTENITIC_MOLYBDENUM('aisi', '316L'),
      AUSTENITIC_MOLYBDENUM('afnor-legacy', 'Z3CND17-11-02'),
    ],
    isoGroup: inGroup('M', 'austénitiques'),
    behaviour: STAINLESS_BEHAVIOUR,
  },
  {
    slug: 'x20cr13-x30cr13',
    designations: [
      MARTENSITIC('en-symbol', 'X20Cr13'),
      MARTENSITIC('en-symbol', 'X30Cr13'),
      MARTENSITIC('material-number', '1.4021'),
      MARTENSITIC('material-number', '1.4028'),
      MARTENSITIC('aisi', '420'),
      MARTENSITIC('afnor-legacy', 'Z20C13'),
      MARTENSITIC('afnor-legacy', 'Z30C13'),
    ],
    isoGroup: inGroup('M', 'ferritiques et martensitiques'),
    behaviour: STAINLESS_BEHAVIOUR,
  },
  {
    slug: 'x5crnicunb16-4',
    designations: [
      PRECIPITATION('en-symbol', 'X5CrNiCuNb16-4'),
      PRECIPITATION('material-number', '1.4542'),
      PRECIPITATION('common-name', '17-4 PH'),
      PRECIPITATION('aisi', '630'),
      PRECIPITATION('afnor-legacy', 'Z6CNU17-04'),
    ],
    isoGroup: inGroup('M'),
    behaviour: STAINLESS_BEHAVIOUR,
  },
  {
    slug: 'x2crnimon22-5-3',
    designations: [
      DUPLEX('en-symbol', 'X2CrNiMoN22-5-3'),
      DUPLEX('material-number', '1.4462'),
      DUPLEX('aisi', '2205'),
      DUPLEX('afnor-legacy', 'Z3CND22-05Az'),
    ],
    isoGroup: inGroup('M', 'duplex'),
    behaviour: STAINLESS_BEHAVIOUR,
  },
  {
    slug: 'en-gjl-250',
    designations: [
      GREY_IRON('en-symbol', 'EN-GJL-250'),
      GREY_IRON('common-name', 'GG25'),
      GREY_IRON('afnor-legacy', 'FGL 250'),
      GREY_IRON('afnor-legacy', 'Ft 25'),
    ],
    isoGroup: inGroup('K', 'grise'),
    behaviour: CAST_IRON_BEHAVIOUR,
  },
  {
    slug: 'en-gjs-400-15',
    designations: [
      DUCTILE_IRON('en-symbol', 'EN-GJS-400-15'),
      DUCTILE_IRON('afnor-legacy', 'FGS 400'),
      DUCTILE_IRON('common-name', 'GGG40'),
    ],
    isoGroup: inGroup('K', 'nodulaire'),
    behaviour: CAST_IRON_BEHAVIOUR,
  },
  {
    slug: 'en-gjs-500-7',
    designations: [
      DUCTILE_IRON('en-symbol', 'EN-GJS-500-7'),
      DUCTILE_IRON('afnor-legacy', 'FGS 500'),
      DUCTILE_IRON('common-name', 'GGG50'),
    ],
    isoGroup: inGroup('K', 'nodulaire'),
    behaviour: CAST_IRON_BEHAVIOUR,
  },
  {
    slug: 'en-aw-2017a',
    designations: [ALU_COPPER('en-symbol', 'EN AW-2017A'), ALU_COPPER('common-name', 'AU4G')],
    isoGroup: inGroup('N', 'aluminium'),
    behaviour: NON_FERROUS_BEHAVIOUR,
  },
  {
    slug: 'en-aw-2024',
    designations: [ALU_COPPER('en-symbol', 'EN AW-2024'), ALU_COPPER('common-name', 'AU4G1')],
    isoGroup: inGroup('N', 'aluminium'),
    behaviour: NON_FERROUS_BEHAVIOUR,
  },
  {
    slug: 'en-aw-2011-2030',
    designations: [
      ALU_FREE_CUTTING('en-symbol', 'EN AW-2011'),
      ALU_FREE_CUTTING('en-symbol', 'EN AW-2030'),
      ALU_FREE_CUTTING('common-name', 'AU5PbBi'),
    ],
    isoGroup: inGroup('N', 'aluminium'),
    behaviour: NON_FERROUS_BEHAVIOUR,
  },
  {
    slug: 'titane-grade-2',
    designations: [
      PURE_TITANIUM('common-name', 'Titane Grade 2'),
      PURE_TITANIUM('uns', 'R50400'),
      PURE_TITANIUM('material-number', '3.7035'),
    ],
    isoGroup: inGroup('S', 'titane'),
    behaviour: SUPERALLOY_BEHAVIOUR,
  },
  {
    slug: 'ta6v',
    designations: [
      ALPHA_BETA_TITANIUM('common-name', 'TA6V'),
      ALPHA_BETA_TITANIUM('common-name', 'Ti-6Al-4V'),
      ALPHA_BETA_TITANIUM('common-name', 'Gr.5'),
      ALPHA_BETA_TITANIUM('uns', 'R56400'),
      ALPHA_BETA_TITANIUM('material-number', '3.7165'),
    ],
    isoGroup: inGroup('S', 'titane'),
    behaviour: SUPERALLOY_BEHAVIOUR,
  },
  {
    slug: 'inconel-718',
    designations: [
      NICKEL_PH('common-name', 'Inconel 718'),
      NICKEL_PH('uns', 'N07718'),
      NICKEL_PH('material-number', '2.4668'),
    ],
    isoGroup: inGroup('S', 'base nickel'),
    behaviour: SUPERALLOY_BEHAVIOUR,
  },
  {
    slug: 'inconel-625',
    designations: [NICKEL_SOLUTION('common-name', 'Inconel 625'), NICKEL_SOLUTION('uns', 'N06625')],
    isoGroup: inGroup('S', 'base nickel'),
    behaviour: SUPERALLOY_BEHAVIOUR,
  },
  {
    slug: 'hastelloy-c276',
    designations: [
      NICKEL_SOLUTION('common-name', 'Hastelloy C276'),
      NICKEL_SOLUTION('uns', 'N10276'),
    ],
    isoGroup: inGroup('S', 'base nickel'),
    behaviour: SUPERALLOY_BEHAVIOUR,
  },
  {
    slug: 'haynes-25',
    designations: [COBALT('common-name', 'Haynes 25'), COBALT('uns', 'R30605')],
    isoGroup: inGroup('S', 'base cobalt'),
    behaviour: SUPERALLOY_BEHAVIOUR,
  },
  {
    slug: 'stellite-6',
    designations: [COBALT('common-name', 'Stellite 6'), COBALT('uns', 'R30006')],
    isoGroup: inGroup('H', 'stellites'),
    behaviour: HARD_BEHAVIOUR,
  },
  {
    slug: '100cr6-trempe',
    designations: [HARDENED_BEARING('common-name', '100Cr6 trempé')],
    isoGroup: inGroup('H', 'aciers trempés'),
    behaviour: HARD_BEHAVIOUR,
  },
  {
    slug: '16mncr5-trempe',
    designations: [HARDENED_BEARING('common-name', '16MnCr5 trempé')],
    isoGroup: inGroup('H', 'aciers trempés'),
    behaviour: HARD_BEHAVIOUR,
  },
  {
    slug: 'x153crmov12',
    designations: [
      COLD_WORK_TOOL('en-symbol', 'X153CrMoV12'),
      COLD_WORK_TOOL('material-number', '1.2379'),
      COLD_WORK_TOOL('aisi', 'D2'),
      COLD_WORK_TOOL('afnor-legacy', 'Z160CDV12'),
    ],
    isoGroup: inGroup('H', 'aciers trempés'),
    behaviour: HARD_BEHAVIOUR,
  },
];
